import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Phone,
  Edit3,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Shield,
  Clock,
  User,
  FileText,
  CreditCard,
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  Activity,
  Navigation, // Add Navigation icon
} from "lucide-react-native";

export default function DebtorDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [debtor, setDebtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchDebtorDetails = async () => {
    try {
      const response = await fetch(`/api/debtors/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch debtor details");
      }
      const data = await response.json();
      setDebtor(data);
    } catch (error) {
      console.error("Error fetching debtor details:", error);
      Alert.alert("Error", "Failed to load debtor details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDebtorDetails();
    }
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDebtorDetails();
  };

  const makeCall = () => {
    if (debtor?.phone) {
      Linking.openURL(`tel:${debtor.phone}`);
    } else {
      Alert.alert(
        "No Phone Number",
        "This debtor does not have a phone number on file",
      );
    }
  };

  const handleStartVisit = () => {
    // Navigate to visit page with debtor information
    router.push({
      pathname: "/(tabs)/visit",
      params: {
        debtorId: debtor.id,
        debtorName: debtor.full_name,
        debtorAddress: debtor.address,
        debtorPhone: debtor.phone,
        totalAmount: debtor.total_amount,
        remainingAmount: debtor.remainingAmount,
        pinfl: debtor.pinfl,
      },
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      case "paid":
        return "#3b82f6";
      case "defaulted":
        return "#7c3aed";
      default:
        return "#6b7280";
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return "#ef4444";
    if (riskScore >= 60) return "#f59e0b";
    if (riskScore >= 40) return "#eab308";
    return "#10b981";
  };

  const TabButton = ({ tab, label, icon: Icon, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: isActive ? "#3b82f6" : "transparent",
      }}
    >
      <Icon color={isActive ? "#3b82f6" : "#64748b"} size={18} />
      <Text
        style={{
          color: isActive ? "#3b82f6" : "#64748b",
          fontSize: 12,
          fontWeight: isActive ? "600" : "500",
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <View
      style={{
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: "#334155",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Icon color={color} size={16} />
        {trend && (
          <View
            style={{
              marginLeft: "auto",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TrendingUp color="#10b981" size={12} />
          </View>
        )}
      </View>
      <Text
        style={{
          color: color,
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: "#94a3b8", fontSize: 11, fontWeight: "600" }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const InfoRow = ({ icon: Icon, label, value, color = "#ffffff" }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
      }}
    >
      <Icon color="#64748b" size={16} />
      <Text style={{ color: "#94a3b8", fontSize: 14, marginLeft: 12, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: 14, fontWeight: "500" }}>
        {value || "N/A"}
      </Text>
    </View>
  );

  const HistoryItem = ({
    icon: Icon,
    title,
    date,
    amount,
    status,
    description,
  }) => (
    <View
      style={{
        backgroundColor: "#1e293b",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#334155",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Icon color="#3b82f6" size={16} />
        <Text
          style={{
            color: "#ffffff",
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 8,
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 12 }}>
          {formatDate(date)}
        </Text>
      </View>
      {amount && (
        <Text
          style={{
            color: "#10b981",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          {formatCurrency(amount)}
        </Text>
      )}
      {status && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={{ color: "#94a3b8", fontSize: 12 }}>
            Status:{" "}
            <Text style={{ color: getStatusColor(status) }}>{status}</Text>
          </Text>
        </View>
      )}
      {description && (
        <Text style={{ color: "#94a3b8", fontSize: 12, lineHeight: 16 }}>
          {description}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <Activity color="#3b82f6" size={32} />
        <Text style={{ color: "#94a3b8", marginTop: 16 }}>
          Loading debtor details...
        </Text>
      </View>
    );
  }

  if (!debtor) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <XCircle color="#ef4444" size={48} />
        <Text
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 16,
          }}
        >
          Debtor Not Found
        </Text>
        <Text
          style={{
            color: "#94a3b8",
            marginTop: 8,
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        >
          The debtor you're looking for could not be found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#3b82f6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 24,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#1e293b",
          borderBottomWidth: 1,
          borderBottomColor: "#334155",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
            >
              {debtor.full_name}
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              PINFL: {debtor.pinfl}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={makeCall}
              style={{
                backgroundColor: "#10b981",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Phone color="#ffffff" size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartVisit}
              style={{
                backgroundColor: "#3b82f6",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Navigation color="#ffffff" size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#334155",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Edit3 color="#94a3b8" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <MetricCard
            icon={DollarSign}
            title="DEBT AMOUNT"
            value={formatCurrency(debtor.remainingAmount)}
            subtitle={`of ${formatCurrency(debtor.total_amount)}`}
            color="#ef4444"
          />

          <MetricCard
            icon={Calendar}
            title="DAYS LATE"
            value={`${debtor.daysLate}+`}
            subtitle="days"
            color="#f59e0b"
          />
        </View>

        <View style={{ flexDirection: "row" }}>
          <MetricCard
            icon={Shield}
            title="RISK SCORE"
            value={`${debtor.riskScore}%`}
            subtitle="risk level"
            color={getRiskColor(debtor.riskScore)}
          />

          <MetricCard
            icon={AlertTriangle}
            title="STATUS"
            value={debtor.status?.toUpperCase()}
            subtitle="current"
            color={getStatusColor(debtor.status)}
          />
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          backgroundColor: "#1e293b",
          borderBottomWidth: 1,
          borderBottomColor: "#334155",
          flexDirection: "row",
        }}
      >
        <TabButton
          tab="overview"
          label="Overview"
          icon={Eye}
          isActive={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />
        <TabButton
          tab="payments"
          label="Payments"
          icon={CreditCard}
          isActive={activeTab === "payments"}
          onPress={() => setActiveTab("payments")}
        />
        <TabButton
          tab="calls"
          label="Calls"
          icon={Phone}
          isActive={activeTab === "calls"}
          onPress={() => setActiveTab("calls")}
        />
        <TabButton
          tab="notes"
          label="Notes"
          icon={FileText}
          isActive={activeTab === "notes"}
          onPress={() => setActiveTab("notes")}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
      >
        {activeTab === "overview" && (
          <View style={{ padding: 16 }}>
            {/* Account Information */}
            <View
              style={{
                backgroundColor: "#1e293b",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#334155",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 16,
                }}
              >
                Account Information
              </Text>

              <InfoRow icon={User} label="Full Name" value={debtor.full_name} />
              <InfoRow icon={FileText} label="PINFL" value={debtor.pinfl} />
              <InfoRow
                icon={CreditCard}
                label="ID Card"
                value={debtor.id_card}
              />
              <InfoRow icon={Phone} label="Phone" value={debtor.phone} />
              <InfoRow icon={MapPin} label="Address" value={debtor.address} />
              <InfoRow
                icon={Calendar}
                label="Created"
                value={formatDate(debtor.created_at)}
              />
            </View>

            {/* Collection Summary */}
            <View
              style={{
                backgroundColor: "#1e293b",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#334155",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 16,
                }}
              >
                Collection Summary
              </Text>

              <InfoRow
                icon={DollarSign}
                label="Total Debt"
                value={formatCurrency(debtor.total_amount)}
                color="#ef4444"
              />
              <InfoRow
                icon={CheckCircle}
                label="Total Paid"
                value={formatCurrency(debtor.totalPaid)}
                color="#10b981"
              />
              <InfoRow
                icon={AlertTriangle}
                label="Remaining"
                value={formatCurrency(debtor.remainingAmount)}
                color="#f59e0b"
              />
              <InfoRow
                icon={Calendar}
                label="Last Payment"
                value={
                  debtor.lastPayment
                    ? formatDate(debtor.lastPayment.payment_date)
                    : "Never"
                }
              />
              <InfoRow
                icon={Phone}
                label="Last Contact"
                value={
                  debtor.lastContact
                    ? formatDate(debtor.lastContact.call_date)
                    : "Never"
                }
              />
            </View>
          </View>
        )}

        {activeTab === "payments" && (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Payment History ({debtor.paymentHistory?.length || 0})
            </Text>

            {debtor.paymentHistory?.length > 0 ? (
              debtor.paymentHistory.map((payment, index) => (
                <HistoryItem
                  key={index}
                  icon={CreditCard}
                  title={`Payment #${payment.id}`}
                  date={payment.payment_date}
                  amount={payment.amount}
                  status={payment.payment_method}
                  description={payment.notes}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 32 }}>
                <CreditCard color="#64748b" size={48} />
                <Text style={{ color: "#94a3b8", marginTop: 16 }}>
                  No payment history found
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "calls" && (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Call History ({debtor.callHistory?.length || 0})
            </Text>

            {debtor.callHistory?.length > 0 ? (
              debtor.callHistory.map((call, index) => (
                <HistoryItem
                  key={index}
                  icon={Phone}
                  title={`${call.call_type} Call`}
                  date={call.call_date}
                  status={call.outcome}
                  description={`Duration: ${call.duration_minutes || 0} min${call.notes ? ` • ${call.notes}` : ""}`}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 32 }}>
                <Phone color="#64748b" size={48} />
                <Text style={{ color: "#94a3b8", marginTop: 16 }}>
                  No call history found
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "notes" && (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Notes & Actions ({debtor.notes?.length || 0})
            </Text>

            {debtor.notes?.length > 0 ? (
              debtor.notes.map((note, index) => (
                <HistoryItem
                  key={index}
                  icon={MessageCircle}
                  title={
                    note.note_type?.charAt(0).toUpperCase() +
                      note.note_type?.slice(1) || "Note"
                  }
                  date={note.created_at}
                  status={note.is_important ? "Important" : "Normal"}
                  description={note.content}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 32 }}>
                <MessageCircle color="#64748b" size={48} />
                <Text style={{ color: "#94a3b8", marginTop: 16 }}>
                  No notes found
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
