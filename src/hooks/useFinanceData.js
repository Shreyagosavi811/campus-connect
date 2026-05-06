import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useFinanceData = (user) => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [allPlatformUsers, setAllPlatformUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [usersRes, feesRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/fees')
      ]);

      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      const allFees = Array.isArray(feesRes.data) ? feesRes.data : [];

      let deptStudents = allUsers.filter(u => u.role?.toUpperCase() === "STUDENT");
      if (user?.role?.toUpperCase() !== "ADMIN") {
        deptStudents = deptStudents.filter(u => u.department?.toLowerCase() === user?.department?.toLowerCase());
      }

      setStudents(deptStudents);
      setAllPlatformUsers(allUsers.filter(u => u.role?.toUpperCase() !== "STUDENT"));
      setFees(allFees);
    } catch (err) {
      setError(err.message || 'Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUserAccess = async (targetUser) => {
    try {
      const updatedUser = { ...targetUser, financeAccess: !targetUser.financeAccess };
      await api.put(`/api/users/${targetUser.id}`, updatedUser);
      await fetchData(); // Refresh
      return true;
    } catch (e) {
      console.error("Error updating user access", e);
      return false;
    }
  };

  const getStudentTransactions = async (studentId) => {
    try {
      const res = await api.get(`/api/transactions/user/${studentId}`);
      return res.data;
    } catch (e) {
      console.error("Failed to fetch transactions", e);
      return [];
    }
  };

  const assignFee = async (feeData) => {
    try {
      await api.post('/api/fees', feeData);
      await fetchData();
      return true;
    } catch (e) {
      console.error("Error assigning fee", e);
      return false;
    }
  };

  const logPayment = async (feeId, paymentData) => {
    try {
      await api.put(`/api/fees/${feeId}`, paymentData);
      await fetchData();
      return true;
    } catch (e) {
      console.error("Error logging payment", e);
      return false;
    }
  };

  return {
    students,
    fees,
    allPlatformUsers,
    loading,
    error,
    fetchData,
    toggleUserAccess,
    getStudentTransactions,
    assignFee,
    logPayment
  };
};
