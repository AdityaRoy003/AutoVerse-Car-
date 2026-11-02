const getAuthHeaders = () => {
  const token = localStorage.getItem('autoverse_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Cars API
  async getCars(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/cars?${query}`);
    return res.json();
  },

  async getCarBySlug(slug: string) {
    const res = await fetch(`/api/cars/${slug}`);
    return res.json();
  },

  async createCarModel(data: any) {
    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCarModel(id: string, data: any) {
    const res = await fetch(`/api/cars/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addVariant(carModelId: string, data: any) {
    const res = await fetch(`/api/cars/${carModelId}/variants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Used Cars API
  async getUsedCars(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/used-cars?${query}`);
    return res.json();
  },

  async getUsedCarByStockId(stockId: string) {
    const res = await fetch(`/api/used-cars/${stockId}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createUsedCar(data: any) {
    const res = await fetch('/api/used-cars', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateInspectionReport(stockId: string, data: any) {
    const res = await fetch(`/api/used-cars/${stockId}/inspection`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Pricing API
  async getOnRoadPrice(variantId: string, cityId?: string) {
    const url = `/api/pricing/on-road/${variantId}${cityId ? `?cityId=${cityId}` : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  async getCities() {
    const res = await fetch('/api/pricing/cities');
    return res.json();
  },

  async calculateEMI(principal: number, interestRate: number, tenureMonths: number) {
    const res = await fetch('/api/pricing/calculate-emi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ principal, interestRate, tenureMonths }),
    });
    return res.json();
  },

  async getAllPricing() {
    const res = await fetch('/api/pricing', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createPricing(data: any) {
    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updatePricing(id: string, data: any) {
    const res = await fetch(`/api/pricing/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Showrooms API
  async getShowrooms() {
    const res = await fetch('/api/showrooms');
    return res.json();
  },

  async getDemoVehicles(showroomId: string, carModelId?: string) {
    const url = `/api/showrooms/${showroomId}/demo-vehicles${carModelId ? `?carModelId=${carModelId}` : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  async getWorkshops() {
    const res = await fetch('/api/services/workshops');
    return res.json();
  },

  // Bookings API
  async getAvailableSlots(demoVehicleId: string, date: string) {
    const res = await fetch(`/api/bookings/available-slots?demoVehicleId=${demoVehicleId}&date=${date}`);
    return res.json();
  },

  async createBooking(data: any) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMyBookings() {
    const res = await fetch('/api/bookings/my-bookings', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAllBookings(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/bookings?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, cancellationReason?: string) {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, cancellationReason }),
    });
    return res.json();
  },

  // Leads API
  async submitLead(data: any) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitTradeIn(data: any) {
    const res = await fetch('/api/leads/trade-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getLeads(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/leads?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getLeadById(id: string) {
    const res = await fetch(`/api/leads/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateLeadStatus(id: string, status: string, note?: string) {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });
    return res.json();
  },

  async reassignLead(id: string, newConsultantId: string, reason: string) {
    const res = await fetch(`/api/leads/${id}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newConsultantId, reason }),
    });
    return res.json();
  },

  async addLeadNote(id: string, note: string) {
    const res = await fetch(`/api/leads/${id}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note }),
    });
    return res.json();
  },

  async sendLeadReply(id: string, messageBody: string, channel: string, isEdited: boolean) {
    const res = await fetch(`/api/leads/${id}/send-reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messageBody, channel, isEdited }),
    });
    return res.json();
  },

  async importCSVLeads(file: File, isPreview = false) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('autoverse_token');

    const res = await fetch(`/api/leads/import-csv?preview=${isPreview}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return res.json();
  },

  // Admin API
  async getAdminDashboard() {
    const res = await fetch('/api/admin/dashboard', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createAdminUser(data: any) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAdminUser(id: string, data: any) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAuditLogs(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/admin/audit-logs?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getOffers() {
    const res = await fetch('/api/admin/offers');
    return res.json();
  },

  // Service Booking API
  async getAvailableServiceSlots(workshopId: string, date: string) {
    const res = await fetch(`/api/services/available-slots?workshopId=${workshopId}&date=${date}`);
    return res.json();
  },

  async createServiceBooking(data: any) {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMyServiceBookings() {
    const res = await fetch('/api/services/my-bookings', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAllServiceBookings(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/services?${query}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateServiceBookingStatus(id: string, status: string) {
    const res = await fetch(`/api/services/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // DMS Exports (authenticated binary file download)
  async downloadDmsSalesCsv(date?: string) {
    const token = localStorage.getItem('autoverse_token');
    const url = `/api/admin/dms-export/sales${date ? `?date=${date}` : ''}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to download DMS sales CSV');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `autoverse_dms_sales_${date || new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  async downloadDmsServiceCsv(date?: string) {
    const token = localStorage.getItem('autoverse_token');
    const url = `/api/admin/dms-export/service${date ? `?date=${date}` : ''}`;
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to download DMS service CSV');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `autoverse_dms_service_${date || new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  // AI Intelligence & Valuation API
  async suggestUsedCarPrice(data: {
    modelName: string;
    manufacturingYear: number;
    kilometres: number;
    fuelType?: string;
    transmission?: string;
    ownershipCount?: number;
    conditionScore?: number;
  }) {
    const res = await fetch('/api/ai/suggest-used-car-price', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async summariseLead(data: any) {
    const res = await fetch('/api/ai/summarise-lead', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async draftReply(data: any) {
    const res = await fetch('/api/ai/draft-reply', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

