import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import CustomerDetailsTabs from '../components/CustomerDetailsTabs';
import AddCustomerDialog from '../components/AddCustomerDialog';
import ReceivePaymentDialog from '../components/ReceivePaymentDialog';
import { Banknote } from 'lucide-react';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const fetchCustomer = async () => {
    try {
      // @ts-ignore
      const result = await window.api.customers.get(id);
      setCustomer(result);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-bold text-navy animate-pulse">
            Retrieving customer profile...
          </p>
        </div>
      </div>
    );

  if (!customer)
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-navy/20">
        <div className="max-w-md mx-auto py-12">
          <User
            size={64}
            className="mx-auto mb-4 text-destructive opacity-20"
          />
          <h2 className="text-2xl font-black text-navy mb-2">
            Customer Not Found
          </h2>
          <p className="text-text-secondary mb-6 font-medium">
            The customer record you're looking for doesn't exist or has been
            removed.
          </p>
          <Button
            onClick={() => navigate('/customers')}
            variant="navy"
            className="rounded-xl h-12 px-8 font-black"
          >
            Back to Customer List
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Button
        variant="ghost"
        onClick={() => navigate('/customers')}
        className="group gap-2 text-navy/40 hover:text-navy transition-all font-black px-0 hover:bg-transparent uppercase text-xs tracking-widest"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Customers
      </Button>

      {/* Hero Header */}
      <Card className="relative overflow-hidden rounded-[40px] bg-navy text-white p-10 shadow-2xl shadow-navy/20 border-none">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none">
          <User size={240} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 bg-primary rounded-[28px] flex items-center justify-center text-navy shadow-2xl shadow-primary/40 border-4 border-white/10 shrink-0">
              <span className="text-4xl font-black">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-5xl font-black tracking-tighter uppercase">
                  {customer.name}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-primary/20 text-primary border-primary/30 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
                >
                  {customer.companyName ? 'Corporate' : 'Personal'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/50 font-bold">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-primary" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-primary" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.companyName && (
                  <div className="flex items-center gap-2">
                    <Building size={18} className="text-primary" />
                    <span>{customer.companyName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsPaymentDialogOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-2 h-14 px-8 rounded-2xl font-black transition-all active:scale-95 shadow-xl"
            >
              <Banknote size={20} />
              Receive Payment
            </Button>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2 h-14 px-8 rounded-2xl font-black transition-all active:scale-95 shadow-xl"
            >
              <Edit size={20} />
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column: Stats & Meta */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-8 bg-white rounded-[32px] border border-navy/5 shadow-soft">
            <h3 className="text-sm font-black text-navy/30 uppercase tracking-[0.2em] mb-6">
              Contact Information
            </h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs font-black text-navy/40 uppercase tracking-widest">
                  Address
                </p>
                <div className="flex gap-2 text-navy font-bold leading-relaxed">
                  <MapPin size={16} className="text-primary shrink-0 mt-1" />
                  <span>{customer.address || 'No address provided'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-black text-navy/40 uppercase tracking-widest">
                  Customer Since
                </p>
                <div className="flex gap-2 text-navy font-bold">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <span>
                    {new Date(customer.createdAt).toLocaleDateString(
                      undefined,
                      { dateStyle: 'long' },
                    )}
                  </span>
                </div>
              </div>
              {customer.ntn && (
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-navy/40 uppercase tracking-widest">
                    Tax / NTN Number
                  </p>
                  <div className="text-navy font-black bg-navy/5 px-3 py-1.5 rounded-xl inline-block">
                    {customer.ntn}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Dynamic Tabs */}
        <div className="xl:col-span-3">
          <CustomerDetailsTabs customerId={id!} customer={customer} />
        </div>
      </div>

      <AddCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchCustomer}
        customer={customer}
      />

      <ReceivePaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        customerId={id!}
        onSuccess={() => {
          // fetchCustomer is called to update balance, but tabs fetch their own data
          // so maybe dispatch an event or force re-render. Since we reload customer, it might not reload tabs?
          fetchCustomer();
          window.dispatchEvent(new Event('customer-payment-received'));
        }}
      />
    </div>
  );
}
