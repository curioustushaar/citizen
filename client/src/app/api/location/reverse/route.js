import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function pickCity(address) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    ''
  );
}

function pickArea(address) {
  return (
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.residential ||
    address.city_district ||
    ''
  );
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lng);
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'citizen-portal/1.0 (support@citizen-portal.local)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 502 });
    }

    const data = await response.json();
    const address = data?.address || {};

    const city = pickCity(address);
    const area = pickArea(address);
    const pincode = address.postcode || '';
    const fullAddress = data?.display_name || '';

    return NextResponse.json({ city, area, pincode, fullAddress });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 500 });
  }
}
