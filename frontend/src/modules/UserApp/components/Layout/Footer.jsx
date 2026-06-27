import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-transparent text-gray-800 py-10 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-12 lg:px-24 xl:px-40 flex flex-col md:flex-row justify-between items-start gap-8">
        
        {/* Address Section */}
        <div className="flex items-start gap-4 max-w-md">
          <div className="text-[#D4AF37] text-3xl mt-1">
            <FiMapPin fill="#D4AF37" className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Kimaya Ayurveda</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Patil's API Corner, V9F9+3WM, Maya Nagar,<br />
              MIDC Industrial Area, Chilkalthana,<br />
              Chhatrapati Sambhajinagar, Maharashtra 431006
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex items-center gap-3 px-2 py-2">
            <FaWhatsapp className="text-4xl text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-600">Dr. Amol Deshmukh (BAMS)</p>
              <p className="text-2xl font-bold tracking-wider text-gray-900">9356593988</p>
            </div>
        </div>

      </div>
      
      {/* Copyright */}
      <div className="container mx-auto px-4 md:px-12 lg:px-24 xl:px-40 mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Kimaya Ayurveda. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
