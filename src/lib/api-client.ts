export class ApiClient {
  static async getProducts() {
    const res = await fetch("/api/products");
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error?.message || "Failed to fetch products");
    return json.data;
  }

  static async getWarehouses() {
    const res = await fetch("/api/warehouses");
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error?.message || "Failed to fetch warehouses");
    return json.data;
  }

  static async getReservation(id: string) {
    const res = await fetch(`/api/reservations/${id}`);
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error?.message || "Failed to fetch reservation");
    return json.data;
  }

  static async reserve(
    productId: string,
    warehouseId: string,
    quantity: number
  ) {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({ productId, warehouseId, quantity }),
    });
    const json = await res.json();
    if (!json.success) throw json.error;
    return json.data;
  }

  static async confirmReservation(id: string) {
    const res = await fetch(`/api/reservations/${id}/confirm`, {
      method: "POST",
    });
    const json = await res.json();
    if (!json.success) throw json.error;
    return json.data;
  }

  static async releaseReservation(id: string) {
    const res = await fetch(`/api/reservations/${id}/release`, {
      method: "POST",
    });
    const json = await res.json();
    if (!json.success) throw json.error;
    return json.data;
  }
}
