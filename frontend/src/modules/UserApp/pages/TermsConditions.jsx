import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';
import { useSettingsStore } from '../../../shared/store/settingsStore';

const TermsConditions = () => {
  const navigate = useNavigate();
  const { settings, initialize } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const content = settings?.content?.termsConditions || 'Terms and Conditions content will be updated soon.';

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={false}>
        <div className="w-full pb-24 lg:pb-12 max-w-7xl mx-auto min-h-screen bg-gray-50">
          {/* Header */}
          <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Terms & Conditions</h1>
          </div>
          
          <div className="p-4 lg:p-8 bg-white m-4 rounded-xl shadow-sm prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default TermsConditions;
