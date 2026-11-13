import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PickupBanner: React.FC = () => {
  const { siteData } = useData();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !siteData.settings.showPickupBanner) {
    return null;
  }

  const notice =
    siteData.settings.pickupNotice ||
    'THE FOOD WILL NOT GET TO YOUR HOME IT SHOULD COME AND COLLECT FROM GIVEN ADDRESS';

  return (
    <div
      id="store-pickup-alert-banner"
      className="bg-[#3E2723] dark:bg-gold-500 text-gold-300 dark:text-chocolate-950 px-4 py-2 text-xs font-bold transition-all border-b border-gold-500/30 shadow-md relative z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto text-center">
          <ShieldAlert className="w-4 h-4 text-gold-400 dark:text-chocolate-900 shrink-0" />
          <span className="tracking-wide">
            <strong>DIRECT STORE PICKUP ONLY:</strong> {notice}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10 dark:hover:bg-chocolate-900/20 text-gold-400 dark:text-chocolate-900 cursor-pointer shrink-0"
          title="Dismiss Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
