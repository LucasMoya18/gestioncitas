import React, { useEffect, useState } from 'react';
import { setApiEnv, availableApiUrls } from '../config/api';

export default function ApiToggle({ className }) {
  const [env, setEnv] = useState('aws');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('api_env') || 'aws';
    setEnv(stored);
  }, []);

  const handleChange = (e) => {
    const newEnv = e.target.value;
    setEnv(newEnv);
    setApiEnv(newEnv);
  };

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select value={env} onChange={handleChange} className="form-select form-select-sm" style={{ width: 170 }}>
        <option value="aws">AWS (35.153...)</option>
        <option value="railway">Railway (proyecto-production)</option>
      </select>
      <small className="text-muted">API</small>
    </div>
  );
}