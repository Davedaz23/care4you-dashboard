'use client';

import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "appointments"));
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
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
          formattedDate: docData.app_date ? format(new Date(docData.app_date), "PPP") : "No date"
        };
      });
      setAppointments(data);
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

  useEffect(() => {
    fetchAppointments();
    fetchHospitals();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Appointment Manager</h1>
      
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

        {/* Appointments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
          
          {loading && appointments.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : appointments.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-gray-500">No appointments scheduled</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4 border-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{appointment.fullName}</h3>
                        <p className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                          <span className="font-medium">Hospital:</span> {appointment.hospitalName}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {appointment.app_time}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {appointment.phoneNumber}
                      </p>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <p className="font-medium">
                        {appointment.formattedDate}
                      </p>
                    </div>
                    
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