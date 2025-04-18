'use client';

import React from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/Image/ImageUpload';
import UploadedImages from '@/components/Image/UploadedImage';

export default function ProductImagesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 space-y-10 bg-[#F1F5FD] p-6 text-[#393938]">
          <h1 className="text-2xl font-semibold text-[#393938]">
            Upload Product Images
          </h1>
          <ImageUpload />
          <UploadedImages />{' '}
        </main>
      </div>
    </div>
  );
}
