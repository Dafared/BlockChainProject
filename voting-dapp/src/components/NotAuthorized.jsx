// components/NotAuthorized.jsx
import React from 'react';

export default function NotAuthorized() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
      <p className="mt-4">You do not have permission to view this page. Only administrators can access it.</p>
    </div>
  );
}
