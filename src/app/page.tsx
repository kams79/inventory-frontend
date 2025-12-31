'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { AuthGuard } from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Inventory Manager
          </h1>
          <p className="text-lg text-gray-600">
            Select a module to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/master-items" className="transition-transform hover:scale-105">
            <Card className="h-full hover:shadow-lg cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Master Items</CardTitle>
                    <CardDescription>Manage your product inventory</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  View, create, and update master items details, including stock levels and pricing.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transactions" className="transition-transform hover:scale-105">
            <Card className="h-full hover:shadow-lg cursor-pointer border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ArrowRightLeft className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Transactions</CardTitle>
                    <CardDescription>Track inventory movements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Record incoming and outgoing stock, view transaction history and status.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}

