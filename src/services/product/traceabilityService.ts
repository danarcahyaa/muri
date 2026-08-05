import { supabase } from "@/lib/supabaseClient";
import { findTraceabilityRecord, normalizeBatchId, type TraceabilityRecord } from "@/data/traceability";

const IS_UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Fetches traceability data directly from Supabase database based on Batch ID, Product SKU, or Production ID.
 * Falls back to static demo records if not found in database.
 *
 * @param value Input Batch ID or SKU
 * @returns TraceabilityRecord or null
 */
export async function fetchTraceabilityRecordFromDb(
  value: string
): Promise<TraceabilityRecord | null> {
  const normalized = normalizeBatchId(value);
  if (!normalized) return null;

  try {
    // 1. Query products table by SKU (exact or ilike) or ID (if UUID)
    let prodQuery = supabase
      .from("products")
      .select(`
        id,
        sku,
        production_id,
        product_name,
        description,
        carbon_saved_kg,
        water_saved_liter,
        created_at,
        brands (
          brand_name,
          address,
          warehouse_address
        ),
        product_categories (
          category_name
        )
      `);

    if (IS_UUID_REGEX.test(normalized)) {
      prodQuery = prodQuery.or(`id.eq.${normalized},production_id.eq.${normalized}`);
    } else {
      prodQuery = prodQuery.ilike("sku", `%${normalized}%`);
    }

    const { data: prodRows, error: prodErr } = await prodQuery;

    if (!prodErr && prodRows && prodRows.length > 0) {
      const prodData = prodRows[0];
      const brandObj = Array.isArray(prodData.brands) ? prodData.brands[0] : prodData.brands;
      const catObj = Array.isArray(prodData.product_categories)
        ? prodData.product_categories[0]
        : prodData.product_categories;

      const brandName = brandObj?.brand_name || "Memuai";
      const categoryName = catObj?.category_name || "Fashion Sirkular";
      const carbon = Number(prodData.carbon_saved_kg ?? 0.8);
      const water = Number(prodData.water_saved_liter ?? 250);
      const dateStr = prodData.created_at
        ? new Date(prodData.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "05 Agustus 2026";

      return {
        batchId: prodData.sku || normalized,
        product: {
          name: prodData.product_name || "Produk Sirkular",
          image: "/product.png",
          alt: prodData.product_name || "Produk sirkular",
        },
        resultTitle: `Perjalanan Material ${categoryName} Menjadi Nilai Guna.`,
        resultDescription: `Hasil kalkulasi konversi material sirkular yang terverifikasi resmi oleh ${brandName}.`,
        timeline: [
          {
            number: "01",
            date: dateStr,
            place: "PT Tekstil Jaya Limbah (Bandung, Jawa Barat)",
            description: "Bahan baku denim dan cotton deadstock diperoleh dari sisa potongan pabrik yang telah melalui verifikasi MURI.",
          },
          {
            number: "02",
            date: dateStr,
            place: "MURI Circular Protocol",
            description: `Paspor material terverifikasi tiga lapis untuk transparansi. SKU #${prodData.sku || normalized}.`,
          },
          {
            number: "03",
            date: dateStr,
            place: brandName,
            description: `${brandName} mengolah material dengan proses sirkular terukur sehingga alur produksi dapat ditelusuri kembali.`,
          },
        ],
        impacts: [
          {
            target: carbon,
            suffix: " Kg",
            label: "Emisi Dicegah",
          },
          {
            target: water,
            suffix: " L",
            label: "Air yang Dihemat",
          },
        ],
      };
    }

    // 2. Query waste_batches by batch_code or id
    let batchQuery = supabase
      .from("waste_batches")
      .select(`
        id,
        batch_code,
        origin_city,
        initial_weight_kg,
        created_at,
        waste_posts (
          custom_fabric_name,
          details_and_conditions
        )
      `);

    if (IS_UUID_REGEX.test(normalized)) {
      batchQuery = batchQuery.eq("id", normalized);
    } else {
      batchQuery = batchQuery.ilike("batch_code", `%${normalized}%`);
    }

    const { data: batchRows, error: batchErr } = await batchQuery;

    if (!batchErr && batchRows && batchRows.length > 0) {
      const batchData = batchRows[0];
      const wp = Array.isArray(batchData.waste_posts)
        ? batchData.waste_posts[0]
        : batchData.waste_posts;

      const fabricName = wp?.custom_fabric_name || "Limbah Kain Perca";
      const dateStr = batchData.created_at
        ? new Date(batchData.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "05 Juli 2026";
      const weight = Number(batchData.initial_weight_kg || 50);

      return {
        batchId: batchData.batch_code || normalized,
        product: {
          name: fabricName,
          image: "/product.png",
          alt: fabricName,
        },
        resultTitle: `Jejak Digital Batch Limbah Kain Terverifikasi.`,
        resultDescription: `Data penelusuran asal-usul material limbah kain perca di fasilitas penyuplai.`,
        timeline: [
          {
            number: "01",
            date: dateStr,
            place: batchData.origin_city ? `Penyedia Limbah (${batchData.origin_city})` : "PT Tekstil Jaya Limbah (Bandung)",
            description: `Penyedia limbah mendaftarkan sisa kain perca dari gudang. Berat awal: ${weight} kg.`,
          },
          {
            number: "02",
            date: dateStr,
            place: "MURI Verifikasi",
            description: `MURI memvalidasi kualitas dan menerbitkan Kode Batch Resmi #${batchData.batch_code}.`,
          },
          {
            number: "03",
            date: dateStr,
            place: "Katalog Sirkular Brand",
            description: `Material aktif dan siap diadopsi oleh brand fashion sirkular MURI.`,
          },
        ],
        impacts: [
          {
            target: Number((weight * 2.5).toFixed(1)),
            suffix: " Kg",
            label: "Emisi Dicegah",
          },
          {
            target: Number((weight * 10).toFixed(0)),
            suffix: " L",
            label: "Air yang Dihemat",
          },
        ],
      };
    }
  } catch (err) {
    console.error("Gagal mengambil data traceability dari Supabase DB:", err);
  }

  // 3. Fallback to static demo records if not found in database
  return findTraceabilityRecord(normalized);
}
