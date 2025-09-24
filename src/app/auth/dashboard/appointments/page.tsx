'use client';

import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw, CreditCard, Clock, XCircle, DollarSign } from "lucide-react";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from '@/context/authContext';


interface Hospital {
  id: string;
  name: string;
  address: string;
}

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  hospitalName: string;
  hospitalID: string;
  app_date: string;
  app_time: string;
  address: string;
  description: string;
  formattedDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Cancelled';
}

export default function AppointmentManager() {
  const { user } = useAdminAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    hospitalName: "",
    hospitalID: "",
    app_date: format(new Date(), "yyyy-MM-dd"),
    app_time: "09:00",
    address: "",
    description: "",
    paymentStatus: 'Pending' as 'Paid' | 'Pending' | 'Cancelled',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All");
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState<string>("Pending");

  const fetchAppointments = async () => {
  setLoading(true);
  try {
    const snapshot = await getDocs(collection(db, "appointments"));
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      
      console.log("Document ID:", doc.id, "Data:", docData); // More detailed debug log
      
      // Handle payment status with better error checking
      let paymentStatus: 'Paid' | 'Pending' | 'Cancelled' = 'Pending';
      
      // Check for paymentStatus field first
      if (docData.paymentStatus) {
        const status = String(docData.paymentStatus).trim();
        if (status.toLowerCase() === 'paid') {
          paymentStatus = 'Paid';
        } else if (status.toLowerCase() === 'cancelled') {
          paymentStatus = 'Cancelled';
        } else if (status.toLowerCase() === 'pending') {
          paymentStatus = 'Pending';
        } else {
          console.warn("Unknown paymentStatus value:", docData.paymentStatus, "in document:", doc.id);
        }
      } 
      // Fallback to check the old 'status' field for backward compatibility
      else if (docData.status) {
        const status = String(docData.status).trim();
        if (status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'completed') {
          paymentStatus = 'Paid';
        } else if (status.toLowerCase() === 'cancelled') {
          paymentStatus = 'Cancelled';
        } else if (status.toLowerCase() === 'pending') {
          paymentStatus = 'Pending';
        } else {
          console.warn("Unknown status value:", docData.status, "in document:", doc.id);
        }
      } else {
        console.warn("No paymentStatus or status field found in document:", doc.id);
      }
      
      console.log("Processed paymentStatus:", paymentStatus, "for document:", doc.id);
      
      return {
        id: doc.id,
        fullName: docData.fullName || "",
        email: docData.email || "",
        phoneNumber: docData.phoneNumber || "",
        hospitalName: docData.hospitalName || "",
        hospitalID: docData.hospitalID || "",
        app_date: docData.app_date || "",
        app_time: docData.app_time || "",
        address: docData.address || "",
        description: docData.description || "",
        formattedDate: docData.app_date ? format(new Date(docData.app_date), "PPP") : "No date",
        paymentStatus: paymentStatus
      };
    });
    setAppointments(data);
    setFilteredAppointments(data);
    
    // Log summary of payment statuses for debugging
    const statusCounts = data.reduce((acc, appt) => {
      acc[appt.paymentStatus] = (acc[appt.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Payment status summary:", statusCounts);
    
  } catch (error) {
    console.error("Error fetching appointments:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchHospitals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "hospitals"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        address: doc.data().address || ""
      }));
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  // Calculate payment status counts
  const paymentStatusCounts = {
    Paid: appointments.filter(appt => appt.paymentStatus === 'Paid').length,
    Pending: appointments.filter(appt => appt.paymentStatus === 'Pending').length,
    Cancelled: appointments.filter(appt => appt.paymentStatus === 'Cancelled').length,
    Total: appointments.length
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phoneNumber || !form.hospitalID) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        hospitalName: form.hospitalName,
        hospitalID: form.hospitalID,
        app_date: form.app_date,
        app_time: form.app_time,
        address: form.address,
        description: form.description,
        paymentStatus: form.paymentStatus,
        // Also update the old status field for backward compatibility
        status: form.paymentStatus === 'Paid' ? 'Confirmed' : 
               form.paymentStatus === 'Cancelled' ? 'Cancelled' : 'Pending'
      };

      if (editId) {
        await updateDoc(doc(db, "appointments", editId), payload);
      } else {
        await addDoc(collection(db, "appointments"), payload);
      }
      
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        hospitalName: "",
        hospitalID: "",
        app_date: format(new Date(), "yyyy-MM-dd"),
        app_time: "09:00",
        address: "",
        description: "",
        paymentStatus: 'Pending'
      });
      setEditId(null);
      fetchAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setForm({
      fullName: appointment.fullName,
      email: appointment.email,
      phoneNumber: appointment.phoneNumber,
      hospitalName: appointment.hospitalName,
      hospitalID: appointment.hospitalID,
      app_date: appointment.app_date || format(new Date(), "yyyy-MM-dd"),
      app_time: appointment.app_time || "09:00",
      address: appointment.address,
      description: appointment.description,
      paymentStatus: appointment.paymentStatus
    });
    setEditId(appointment.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteDoc(doc(db, "appointments", id));
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  };

  const handleHospitalSelect = (hospitalId: string) => {
    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    if (selectedHospital) {
      setForm({
        ...form,
        hospitalName: selectedHospital.name,
        hospitalID: selectedHospital.id
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, paymentStatusFilter);
  };

  const handlePaymentStatusFilterChange = (status: string) => {
    setPaymentStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  const applyFilters = (search: string, status: string) => {
    let filtered = [...appointments];
    
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.fullName.toLowerCase().includes(term) || 
        appt.hospitalName.toLowerCase().includes(term) ||
        appt.phoneNumber.includes(term)
      );
    }
    
    if (status !== "All") {
      filtered = filtered.filter(appt => appt.paymentStatus === status);
    }
    setFilteredAppointments(filtered);
  };

  const toggleAppointmentSelection = (id: string) => {
    setSelectedAppointments(prev => 
      prev.includes(id) 
        ? prev.filter(apptId => apptId !== id) 
        : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedAppointments.length === 0) {
      alert("Please select at least one appointment");
      return;
    }

    try {
      const batch = writeBatch(db);
      
      selectedAppointments.forEach(id => {
        const apptRef = doc(db, "appointments", id);
        // Update both fields for backward compatibility
        batch.update(apptRef, { 
          paymentStatus: bulkPaymentStatus,
          status: bulkPaymentStatus === 'Paid' ? 'Confirmed' : 
                 bulkPaymentStatus === 'Cancelled' ? 'Cancelled' : 'Pending'
        });
      });
      
      await batch.commit();
      setSelectedAppointments([]);
      await fetchAppointments();
    } catch (error) {
      console.error("Error updating appointments:", error);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchHospitals();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Appointment Manager</h1>
      
      {/* Payment Status Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Paid</p>
                <p className="text-2xl font-bold text-green-900">{paymentStatusCounts.Paid}</p>
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Pending</p>
                <p className="text-2xl font-bold text-blue-900">{paymentStatusCounts.Pending}</p>
              </div>
            </div>
            <Badge variant="secondary">Pending</Badge>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{paymentStatusCounts.Cancelled}</p>
              </div>
            </div>
            <Badge variant="destructive">Cancelled</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Total</p>
                <p className="text-2xl font-bold text-gray-900">{paymentStatusCounts.Total}</p>
              </div>
            </div>
            <Badge variant="outline">All</Badge>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Form */}
        <Card className="shadow-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editId ? "Edit Appointment" : "Create New Appointment"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input
                  placeholder="Patient's full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    placeholder="Patient's email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <Input
                    placeholder="Patient's phone"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital *</label>
                <Select onValueChange={handleHospitalSelect} value={form.hospitalID}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <Input
                    type="date"
                    value={form.app_date}
                    onChange={(e) => setForm({ ...form, app_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <Input
                    type="time"
                    value={form.app_time}
                    onChange={(e) => setForm({ ...form, app_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <Select 
                  onValueChange={(value) => setForm({ ...form, paymentStatus: value as any })}
                  value={form.paymentStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  placeholder="Patient's address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  placeholder="Additional notes"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                {editId && (
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        fullName: "",
                        email: "",
                        phoneNumber: "",
                        hospitalName: "",
                        hospitalID: "",
                        app_date: format(new Date(), "yyyy-MM-dd"),
                        app_time: "09:00",
                        address: "",
                        description: "",
                        paymentStatus: "Pending"
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Processing..." : editId ? "Update Appointment" : "Create Appointment"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List with Management Features */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Management</h2>
  <div className="flex gap-2">
     {user?.role === 'superadmin' && (
                <Link href="/auth/dashboard/appointment-reports">
                  <Button variant="default" className="bg-green-600 hover:bg-green-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    See Reports
                  </Button>
                </Link>
              )}
  </div>


          </div>

          {/* Search and Filter Section */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Search className="inline mr-2 h-4 w-4" />
                    Search
                  </label>
                  <Input
                    placeholder="Search by patient, hospital, or phone"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Filter className="inline mr-2 h-4 w-4" />
                    Filter by Payment Status
                  </label>
                  <Select onValueChange={handlePaymentStatusFilterChange} value={paymentStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All payment statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="All">All Payments</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedAppointments.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">
                    {selectedAppointments.length} appointment(s) selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    onValueChange={(value) => setBulkPaymentStatus(value)}
                    value={bulkPaymentStatus}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Set payment status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleBulkUpdate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Payment Status
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setSelectedAppointments([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {loading && filteredAppointments.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-gray-500">No appointments found</p>
              {(searchTerm || paymentStatusFilter !== "All") && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    setSearchTerm("");
                    setPaymentStatusFilter("All");
                    setFilteredAppointments(appointments);
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedAppointments.includes(appointment.id)}
                          onChange={() => toggleAppointmentSelection(appointment.id)}
                          className="mt-1"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{appointment.fullName}</h3>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                            <span className="font-medium">Hospital:</span> {appointment.hospitalName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {appointment.app_time}
                        </span>
                        {getPaymentStatusBadge(appointment.paymentStatus)}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {appointment.phoneNumber}
                      </p>
                      {appointment.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {appointment.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="font-medium">
                        {appointment.formattedDate}
                      </p>
                    </div>
                    
                    {appointment.address && (
                      <div className="mt-2 pt-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Address:</span> {appointment.address}
                        </p>
                      </div>
                    )}
                    
                    {appointment.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="default" 
                        onClick={() => handleEdit(appointment)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}