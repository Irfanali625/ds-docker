"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneValidator } from "@/components/phone-validation/PhoneValidator";
import { ContactType, ContactPhase, Contact } from "@/types";
import { api } from "@/lib/api";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { DashboardTabs } from "./components/DashboardTabs";
import { GetLeads } from "./components/tabs/GetLeads";
import { MyLeads } from "./components/tabs/MyLeads";

export function DashboardView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"get" | "my-leads" | "validator">(
    "get"
  );
  const [selectedType, setSelectedType] = useState<ContactType | null>(null);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [userContacts, setUserContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch random contact
  const fetchRandomContact = async () => {
    if (!selectedType) return;
    setLoading(true);
    setError(null);
    try {
      const contact = await api.getRandomContact(
        selectedType,
        ContactPhase.CLEANED
      );
      setCurrentContact(contact);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contact");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Store contact
  const storeRecord = async (contactId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.storeRecord(contactId, ContactPhase.DELIVERED);
      if (currentContact?.id === contactId) {
        setCurrentContact({ ...currentContact, phase: ContactPhase.DELIVERED });
      }
      alert("Contact stored successfully!");
      loadUserContacts();
    } catch (err: any) {
      setError(err.message || "Failed to store record");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load user leads
  const loadUserContacts = async () => {
    try {
      const contacts = await api.getUserLeads();
      setUserContacts(contacts);
    } catch (err: any) {
      console.error("Failed to load contacts:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "my-leads") {
      loadUserContacts();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNavbar user={user} logout={logout} />
      <main className="max-w-7xl mx-auto p-8">
        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leadsCount={userContacts.length}
        />
        {activeTab === "get" && (
          <GetLeads
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            currentContact={currentContact}
            fetchRandomContact={fetchRandomContact}
            storeRecord={storeRecord}
            error={error}
            loading={loading}
          />
        )}
        {activeTab === "my-leads" && (
          <MyLeads contacts={userContacts} loading={loading} />
        )}
        {activeTab === "validator" && <PhoneValidator />}
      </main>
    </div>
  );
}
