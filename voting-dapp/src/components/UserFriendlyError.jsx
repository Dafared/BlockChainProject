// components/UserFriendlyError.jsx
import React from 'react';

export default function UserFriendlyError({ title, message }) {
  return (
    <div className="p-4 border border-red-400 bg-red-100 text-red-700 rounded my-4">
      <h3 className="font-bold">{title}</h3>
      <p>{message}</p>
    </div>
  );
}
