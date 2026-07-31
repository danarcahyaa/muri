import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { materialTitle, providerName, userPrompt } = body;

    const materialText = materialTitle
      ? `${materialTitle} supplied by ${providerName || "Waste Provider"}`
      : "upcycled denim and linen textile waste";

    const promptText = `high fashion upcycled garment photoshoot and sewing pattern blueprint layout, patchwork design crafted from ${materialText}, ${userPrompt || "sustainable circular apparel, zero waste cutting, editorial studio lighting"}, 8k resolution, photorealistic studio shot`;

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(promptText);

    // Dynamic Pollinations AI Image Endpoint
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;

    const patternSpecs = getPatternSpecsForFabric(materialTitle || "");

    return NextResponse.json({
      success: true,
      output: pollinationsUrl,
      prompt: promptText,
      patternSpecs,
    });
  } catch (error) {
    console.error("[patchwork/generate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses generasi Pollinations AI." },
      { status: 500 },
    );
  }
}

function getPatternSpecsForFabric(materialTitle: string) {
  const title = (materialTitle || "").toLowerCase();

  if (
    title.includes("denim") ||
    title.includes("jean") ||
    title.includes("jeans")
  ) {
    return {
      productName: "Upcycled Patchwork Denim Jacket & Tote Set",
      patternTechnique: "Grid Block Patchwork Zero-Waste",
      needleSpec: "Jarum Heavy-Duty Denim #16 (100/16)",
      threadSpec: "Benang Poliester Tahan Tarik 30s",
      materialEfficiency: "95% Zero-Waste",
      carbonSaved: "3.6 kg CO₂e",
      waterSaved: "850 Liter",
      cuttingPieces: [
        {
          name: "Panel Badan Utama (Depan & Belakang)",
          qty: "2 Pcs",
          size: "48 cm × 68 cm",
          note: "Potongan simetris ikuti serat denim utama",
        },
        {
          name: "Panel Lengan Patchwork Multi-Tone",
          qty: "2 Pcs",
          size: "22 cm × 58 cm",
          note: "Kombinasi 3 variasi perca denim",
        },
        {
          name: "Kantong Depan & Ornamen Kerah",
          qty: "4 Pcs",
          size: "16 cm × 16 cm",
          note: "Potongan persegi zero-waste",
        },
        {
          name: "Strap & Trim Aksesori Tote Bag",
          qty: "2 Pcs",
          size: "8 cm × 90 cm",
          note: "Sisa lipatan pinggir kain",
        },
      ],
      assemblySteps: [
        "Sortir potongan kain sisa denim berdasarkan warna dan gramasi (14oz).",
        "Potong kain mengikuti dimensi pola di atas dengan toleransi jahitan 1.5 cm.",
        "Gabungkan perca-perca kecil menjadi lembaran panel badan dengan jahitan ganda (double-stitching).",
        "Pasang kantong depan dan sambungkan bagian bahu serta lengan.",
        "Finishing dengan obras tepi dan pemasangan kancing logam sirkular.",
      ],
    };
  }

  if (
    title.includes("linen") ||
    title.includes("katun") ||
    title.includes("cotton")
  ) {
    return {
      productName: "Circular Linen Patchwork Oversized Shirt",
      patternTechnique: "Vertical Strip Patchwork",
      needleSpec: "Jarum Standard Ballpoint #11 (75/11)",
      threadSpec: "Benang Katun Organik 40s",
      materialEfficiency: "93% Zero-Waste",
      carbonSaved: "2.8 kg CO₂e",
      waterSaved: "620 Liter",
      cuttingPieces: [
        {
          name: "Panel Badan Utama (Depan & Belakang)",
          qty: "2 Pcs",
          size: "54 cm × 72 cm",
          note: "Potongan serat lurus kain linen",
        },
        {
          name: "Panel Lengan Longgar",
          qty: "2 Pcs",
          size: "24 cm × 52 cm",
          note: "Potongan melintang",
        },
        {
          name: "Kerah Shirt & Manset Lengan",
          qty: "2 Pcs",
          size: "12 cm × 42 cm",
          note: "Lapisan kain perca halus",
        },
      ],
      assemblySteps: [
        "Ratakan dan setrika sisa kain linen/katun.",
        "Potong kain sesuai spesifikasi ukuran pola di atas.",
        "Jahit garis strip antar warna perca menggunakan jahitan Perancis (French seam).",
        "Gabungkan panel depan, belakang, dan pasang kerah kemeja.",
      ],
    };
  }

  // Default pattern spec
  return {
    productName: "Upcycled Circular Patchwork Apparel",
    patternTechnique: "Geometric Modular Patchwork",
    needleSpec: "Jarum Universal #14 (90/14)",
    threadSpec: "Benang Poliester All-Purpose 40s",
    materialEfficiency: "92% Zero-Waste",
    carbonSaved: "3.1 kg CO₂e",
    waterSaved: "500 Liter",
    cuttingPieces: [
      {
        name: "Panel Depan Utama",
        qty: "2 Pcs",
        size: "45 cm × 65 cm",
        note: "Potongan simetris",
      },
      {
        name: "Panel Belakang & Lengan",
        qty: "2 Pcs",
        size: "20 cm × 55 cm",
        note: "Kombinasi perca",
      },
      {
        name: "Trim & Pockets",
        qty: "4 Pcs",
        size: "15 cm × 15 cm",
        note: "Patchwork persegi",
      },
    ],
    assemblySteps: [
      "Persiapkan dan ukur sisa kain yang akan di-upcycle.",
      "Ikuti potongan spesifikasi ukuran pada tabel.",
      "Jahit sambungan antar potongan kain dengan rapi.",
      "Lakukan finishing dan pemeriksaan kualitas akhir.",
    ],
  };
}
