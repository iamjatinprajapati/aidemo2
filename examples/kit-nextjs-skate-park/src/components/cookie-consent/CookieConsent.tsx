'use client';
import { useState, useEffect } from 'react';
import { useCookieConsent } from 'context/CookieConsentContext';

function ToggleSwitch({
  id,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        checked ? 'bg-[#15909c]' : 'bg-[#d2d2d2]',
        disabled ? 'cursor-not-allowed opacity-70' : '',
        'focus-visible:outline-[#15909c]',
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
    >
      <span
        className={[
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

export function CookieConsent() {
  const { hasConsented, preferences, saveConsent, acceptAll, rejectOptional } =
    useCookieConsent();

  // Controls whether the settings modal is open for returning users
  const [isOpen, setIsOpen] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  // Sync toggle with saved preferences whenever the modal opens for editing
  useEffect(() => {
    if (isOpen) {
      setMarketingEnabled(preferences?.marketing ?? false);
    }
  }, [isOpen, preferences]);

  const showModal = !hasConsented || isOpen;
  const isEditing = hasConsented && isOpen;

  const handleSave = () => {
    saveConsent(marketingEnabled);
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    setIsOpen(false);
  };

  const handleRejectOptional = () => {
    rejectOptional();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating "Cookie Settings" button — visible after consent is given */}
      {hasConsented && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open cookie preferences"
          className={[
            'fixed bottom-5 left-5 z-30 flex items-center gap-2',
            'rounded-full bg-white px-3 py-2 shadow-lg ring-1 ring-[#d2d2d2]',
            'text-[11px] font-medium text-[#27272a]',
            'hover:ring-[#89c6cc] hover:shadow-xl transition-all',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#15909c]',
          ].join(' ')}
        >
          <span aria-hidden="true" className="text-base leading-none">🍪</span>
          Cookie Settings
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={isEditing ? () => setIsOpen(false) : undefined}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-description"
            className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white shadow-2xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-lg sm:rounded-2xl"
          >
            {/* Header */}
            <div className="border-b border-[#d2d2d2] px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#89c6cc]/20 text-lg">
                    🍪
                  </span>
                  <h2
                    id="consent-title"
                    className="text-[#222] font-semibold text-[18px] leading-snug"
                  >
                    {isEditing ? 'Cookie Preferences' : 'We Value Your Privacy'}
                  </h2>
                </div>
                {/* Close button only shown when editing existing preferences */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close cookie preferences"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#747474] hover:bg-[#f7f7f7] hover:text-[#222] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M1 1l12 12M13 1L1 13"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <p
                id="consent-description"
                className="text-[#747474] text-[13px] leading-relaxed"
              >
                {isEditing
                  ? 'Update your cookie preferences below. Your changes will take effect immediately.'
                  : 'We use cookies to keep our site running and, with your permission, to understand how you interact with us. You can adjust your preferences below.'}
              </p>

              {/* Strictly Necessary */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-[#d2d2d2] bg-[#fafafa] px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-[#222] text-[13px] font-semibold">
                    Strictly Necessary Cookies
                  </p>
                  <p className="text-[#747474] text-[11px] leading-relaxed">
                    Required for essential site functions like navigation and security. These
                    cannot be disabled.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <ToggleSwitch id="toggle-strict" checked={true} disabled />
                  <span className="text-[10px] text-[#747474]">Always on</span>
                </div>
              </div>

              {/* Marketing & Analytics */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-[#d2d2d2] bg-[#fafafa] px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-[#222] text-[13px] font-semibold">
                    Marketing &amp; Analytics Cookies
                  </p>
                  <p className="text-[#747474] text-[11px] leading-relaxed">
                    Help us understand how visitors use our site so we can improve your
                    experience. Includes analytics and personalization tracking.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <ToggleSwitch
                    id="toggle-marketing"
                    checked={marketingEnabled}
                    onChange={setMarketingEnabled}
                  />
                  <span className="text-[10px] text-[#747474]">
                    {marketingEnabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-2 border-t border-[#d2d2d2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="text-[#747474] text-[12px] underline underline-offset-2 hover:text-[#27272a] transition-colors"
              >
                Reject optional cookies
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none rounded-lg border border-[#89c6cc] px-4 py-2 text-[12px] font-medium text-[#15909c] hover:bg-[#89c6cc]/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#15909c]"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none rounded-lg bg-[#15909c] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#176f89] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#15909c]"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
