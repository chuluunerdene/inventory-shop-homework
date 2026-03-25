export const PAGE_SIZE = 6;

export const MESSAGE_LABELS: Record<string, string> = {
  productSaved: "Бүтээгдэхүүн амжилттай хадгалагдлаа.",
  productDeleted: "Бүтээгдэхүүн амжилттай устгагдлаа.",
  inventoryUpdated: "Нөөц амжилттай шинэчлэгдлээ.",
};

export const ERROR_LABELS: Record<string, string> = {
  invalidProductForm: "Оруулсан мэдээллээ шалгаад дахин оролдоно уу.",
  categoryNotFound: "Сонгосон ангилал олдсонгүй.",
  conflict: "Давхардсан мэдээлэл илэрлээ. Дахин шалгаад оролдоно уу.",
  databaseUnavailable: "Өгөгдлийн сантай холбогдож чадсангүй. Дараа дахин оролдоно уу.",
  productCreateFailed: "Бүтээгдэхүүн үүсгэж чадсангүй. Дахин оролдоно уу.",
  productUpdateFailed: "Бүтээгдэхүүнийг шинэчилж чадсангүй. Дахин оролдоно уу.",
  productDeleteFailed: "Бүтээгдэхүүнийг устгаж чадсангүй. Дахин оролдоно уу.",
  productDeleteBlocked: "Энэ бүтээгдэхүүн захиалгад ашиглагдсан тул устгах боломжгүй.",
  invalidAdjustment: "Нөөцийн өөрчлөлтийн утгаа шалгаад дахин оролдоно уу.",
  insufficientStock: "Үлдэгдэл хүрэлцэхгүй байна.",
  inventoryUpdateFailed: "Нөөцийг шинэчилж чадсангүй. Дахин оролдоно уу.",
  invalidCartPayload: "Сагсны мэдээллээ шалгаад дахин оролдоно уу.",
  productNotFound: "Сонгосон бүтээгдэхүүн олдсонгүй.",
  orderCreateFailed: "Захиалга үүсгэж чадсангүй. Дахин оролдоно уу.",
  connectionFailed: "Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.",
};
