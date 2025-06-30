'use client';

import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  hospitalName: string;
  hospitalID: string;
  app_date: string;
  address: string;
  description: string;
}

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    hospitalName: "",
    hospitalID: "",
    app_date: new Date(),
    address: "",
    description: "",
  });
  const [editId, setEditId] = useState<string | null>(null); // Explicitly typed as string | null

  const fetchAppointments = async () => {
    const snapshot = await getDocs(collection(db, "appointments"));
    const data = snapshot.docs.map((doc) => ({ 
      id: doc.id, 
      fullName: doc.data().fullName,
      email: doc.data().email,
      phoneNumber: doc.data().phoneNumber,
      hospitalName: doc.data().hospitalName,
      hospitalID: doc.data().hospitalID,
      app_date: doc.data().app_date,
      address: doc.data().address,
      description: doc.data().description,
    }));
    setAppointments(data);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      app_date: form.app_date.toISOString().split("T")[0],
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
      app_date: new Date(),
      address: "",
      description: "",
    });
    setEditId(null);
    fetchAppointments();
  };

  const handleEdit = (appointment: Appointment) => {
    setForm({
      fullName: appointment.fullName,
      email: appointment.email,
      phoneNumber: appointment.phoneNumber,
      hospitalName: appointment.hospitalName,
      hospitalID: appointment.hospitalID,
      app_date: new Date(appointment.app_date),
      address: appointment.address,
      description: appointment.description,
    });
    setEditId(appointment.id);
  };

  const handleDelete = async (id: string) => { // Explicitly typed parameter
    await deleteDoc(doc(db, "appointments", id));
    fetchAppointments();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-semibold">
            {editId ? "Edit Appointment" : "Add Appointment"}
          </h2>
          <Input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
          <Input
            placeholder="Hospital Name"
            value={form.hospitalName}
            onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
          />
          <Input
            placeholder="Hospital ID"
            value={form.hospitalID}
            onChange={(e) => setForm({ ...form, hospitalID: e.target.value })}
          />
          <Input
            type="date"
            value={format(form.app_date, "yyyy-MM-dd")}
            onChange={(e) =>
              setForm({ ...form, app_date: new Date(e.target.value) })
            }
          />
          <Input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Button onClick={handleSubmit}>{editId ? "Update" : "Create"}</Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {appointments.map((a) => (
          <Card key={a.id} className="p-4 space-y-2">
            <p className="font-bold">{a.fullName}</p>
            <p>{a.email}</p>
            <p>{a.phoneNumber}</p>
            <p>{a.hospitalName}</p>
            <p>{a.app_date}</p>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(a)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(a.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}