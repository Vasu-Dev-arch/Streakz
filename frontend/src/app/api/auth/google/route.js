import { NextResponse } from 'next/server';
import { route } from '../../../../../lib/api-route.js';
import { getGoogleAuthUrl } from '../../../../../services/google.service.js';

export const GET = route(async () => NextResponse.redirect(getGoogleAuthUrl()));
