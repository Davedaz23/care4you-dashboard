'use client';

import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Building, 
  Filter, 
  ArrowLeft,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

interface Hospital {
  id: string;
  name: string;
  address: string;
}

interface ReportFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  hospital: string;
  startDate: string;
  endDate: string;
}

export default function AppointmentReports() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'daily',
    hospital: 'all',
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd")
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "appointments"));
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        
        let paymentStatus: 'Paid' | 'Pending' | 'Cancelled' = 'Pending';
        
        if (docData.paymentStatus) {
          const status = String(docData.paymentStatus).trim();
          if (status.toLowerCase() === 'paid') paymentStatus = 'Paid';
          else if (status.toLowerCase() === 'cancelled') paymentStatus = 'Cancelled';
        } else if (docData.status) {
          const status = String(docData.status).trim();
          if (status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'completed') paymentStatus = 'Paid';
          else if (status.toLowerCase() === 'cancelled') paymentStatus = 'Cancelled';
        }
        
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
      applyFilters(data, filters);
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

  const applyFilters = (data: Appointment[], filterSettings: ReportFilters) => {
    let filtered = [...data];
    
    // Filter by hospital
    if (filterSettings.hospital !== 'all') {
      filtered = filtered.filter(appt => appt.hospitalID === filterSettings.hospital);
    }
    
    // Filter by date range based on period
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (filterSettings.period) {
      case 'daily':
        startDate = new Date(filterSettings.startDate);
        endDate = new Date(filterSettings.startDate);
        break;
      case 'weekly':
        startDate = startOfWeek(new Date(filterSettings.startDate));
        endDate = endOfWeek(new Date(filterSettings.startDate));
        break;
      case 'monthly':
        startDate = startOfMonth(new Date(filterSettings.startDate));
        endDate = endOfMonth(new Date(filterSettings.startDate));
        break;
      case 'custom':
        startDate = new Date(filterSettings.startDate);
        endDate = new Date(filterSettings.endDate);
        break;
      default:
        startDate = new Date(filterSettings.startDate);
        endDate = new Date(filterSettings.startDate);
    }
    
    // Reset time part for proper date comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(appt => {
      if (!appt.app_date) return false;
      const apptDate = new Date(appt.app_date);
      return apptDate >= startDate && apptDate <= endDate;
    });
    
    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Set default end date for non-custom periods
    if (key === 'period' && value !== 'custom') {
      newFilters.endDate = format(new Date(), "yyyy-MM-dd");
    }
    
    setFilters(newFilters);
    applyFilters(appointments, newFilters);
  };

  const generateStats = () => {
    const total = filteredAppointments.length;
    const paid = filteredAppointments.filter(appt => appt.paymentStatus === 'Paid').length;
    const pending = filteredAppointments.filter(appt => appt.paymentStatus === 'Pending').length;
    const cancelled = filteredAppointments.filter(appt => appt.paymentStatus === 'Cancelled').length;
    
    // Group by hospital
    const byHospital = filteredAppointments.reduce((acc, appt) => {
      acc[appt.hospitalName] = (acc[appt.hospitalName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by date
    const byDate = filteredAppointments.reduce((acc, appt) => {
      const date = appt.app_date ? format(new Date(appt.app_date), "yyyy-MM-dd") : "Unknown";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      paid,
      pending,
      cancelled,
      byHospital,
      byDate
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const stats = generateStats();
    
    // Title
    doc.setFontSize(18);
    doc.text("Appointment Report", 14, 15);
    
    // Filters info
    doc.setFontSize(10);
    doc.text(`Period: ${filters.period}`, 14, 25);
    doc.text(`Date Range: ${format(new Date(filters.startDate), "PPP")} - ${format(new Date(filters.endDate), "PPP")}`, 14, 32);
    if (filters.hospital !== 'all') {
      const hospital = hospitals.find(h => h.id === filters.hospital);
      doc.text(`Hospital: ${hospital?.name || 'Unknown'}`, 14, 39);
    }
    
    // Summary stats
    doc.setFontSize(12);
    doc.text("Summary Statistics", 14, 50);
    doc.text(`Total Appointments: ${stats.total}`, 14, 60);
    doc.text(`Paid: ${stats.paid}`, 14, 67);
    doc.text(`Pending: ${stats.pending}`, 14, 74);
    doc.text(`Cancelled: ${stats.cancelled}`, 14, 81);
    
    // Appointments table
    if (filteredAppointments.length > 0) {
      doc.text("Appointment Details", 14, 95);
      
      const tableData = filteredAppointments.map(appt => [
        appt.fullName,
        appt.hospitalName,
        format(new Date(appt.app_date), "yyyy-MM-dd"),
        appt.app_time,
        appt.paymentStatus
      ]);
      
      autoTable(doc, {
        startY: 100,
        head: [['Patient', 'Hospital', 'Date', 'Time', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    doc.save(`appointment-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportToExcel = () => {
    const stats = generateStats();
    
    // Create main appointments worksheet
    const wsData = [
      ['Patient', 'Email', 'Phone', 'Hospital', 'Date', 'Time', 'Status', 'Address', 'Description']
    ];
    
    filteredAppointments.forEach(appt => {
      wsData.push([
        appt.fullName,
        appt.email,
        appt.phoneNumber,
        appt.hospitalName,
        appt.app_date ? format(new Date(appt.app_date), "yyyy-MM-dd") : "",
        appt.app_time,
        appt.paymentStatus,
        appt.address,
        appt.description
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Create summary worksheet
    const summaryData = [
      ['Appointment Report Summary'],
      [],
      ['Period', filters.period],
      ['Start Date', format(new Date(filters.startDate), "PPP")],
      ['End Date', format(new Date(filters.endDate), "PPP")],
      [],
      ['Total Appointments', stats.total],
      ['Paid', stats.paid],
      ['Pending', stats.pending],
      ['Cancelled', stats.cancelled],
      [],
      ['Appointments by Hospital']
    ];
    
    Object.entries(stats.byHospital).forEach(([hospital, count]) => {
      summaryData.push([hospital, count]);
    });
    
    summaryData.push([], ['Appointments by Date']);
    
    Object.entries(stats.byDate).forEach(([date, count]) => {
      summaryData.push([date, count]);
    });
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    
    XLSX.writeFile(wb, `appointment-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  useEffect(() => {
    fetchAppointments();
    fetchHospitals();
  }, []);

  const stats = generateStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/auth/dashboard/appointments" className="mr-4">
          <Button variant="default">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Appointment Reports</h1>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Report Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
              <Select 
                onValueChange={(value) => handleFilterChange('period', value)}
                value={filters.period}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filters.period === 'custom' ? 'Start Date' : 'Date'}
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            {filters.period === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
              <Select 
                onValueChange={(value) => handleFilterChange('hospital', value)}
                value={filters.hospital}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All hospitals" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Hospitals</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Appointments</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Paid</p>
              <p className="text-2xl font-bold text-green-900">{stats.paid}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
          <FileText className="h-4 w-4 mr-2" />
          Export to PDF
        </Button>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Detailed Report */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            <Badge variant="secondary">
              {filteredAppointments.length} records
            </Badge>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.fullName}</div>
                        <div className="text-sm text-gray-500">{appointment.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.hospitalName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.app_date ? format(new Date(appointment.app_date), "PPP") : "No date"}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.app_time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.paymentStatus === 'Paid' && (
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        )}
                        {appointment.paymentStatus === 'Pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {appointment.paymentStatus === 'Cancelled' && (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}