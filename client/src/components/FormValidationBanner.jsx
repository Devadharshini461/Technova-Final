import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const FormValidationBanner = ({ error, customRef }) => {
  const localRef = useRef(null);
  const refToUse = customRef || localRef;

  useEffect(() => {
    if (error && refToUse.current) {
      refToUse.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  if (!error) return null;

  const errorList = Array.isArray(error) ? error : [error];

  return (
    <div
      ref={refToUse}
      className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl animate-in fade-in zoom-in-95 duration-200 my-3"
    >
      <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>Validation Error / Action Required</span>
      </div>
      {errorList.length === 1 ? (
        <p className="text-rose-700 font-medium pl-6 leading-relaxed">{errorList[0]}</p>
      ) : (
        <ul className="list-disc pl-9 space-y-1 font-medium text-rose-700">
          {errorList.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
