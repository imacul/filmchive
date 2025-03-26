"use client";

import { useState } from 'react';

// Removed unused AlertType definition

const useAlert = () => {
  type AlertType = { show: boolean; text: string; type: 'danger' | 'success' };
  const [alert, setAlert] = useState<AlertType>({ show: false, text: '', type: 'danger' });

  const showAlert = ({ text, type = 'danger' }: { show?: boolean; text: string; type?: 'danger' | 'success' }) => setAlert({ show: true, text, type });
  const hideAlert = () => setAlert({ show: false, text: '', type: 'danger' });

  return { alert, showAlert, hideAlert };
};

export default useAlert;