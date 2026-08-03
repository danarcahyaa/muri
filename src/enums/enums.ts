export enum EntityRole {
  CONSUMER = "consumer",
  BRAND = "brand",
  WASTE_PROVIDER = "waste_provider",
}

export enum WastePostStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SOLD_OUT = "sold_out",
}

export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  COMPLETE = "complete",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum WorkshopRegistrationStatus {
  REGISTERED = "registered",
  ATTENDED = "attended",
  CANCELLED = "cancelled",
}