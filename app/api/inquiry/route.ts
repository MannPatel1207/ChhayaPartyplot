import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Inquiry } from '@/app/models/Inquiry';
import { saveContactSubmission } from '@/app/util/storage/storage';
import { z } from 'zod';
import {sendDailyEmail} from '../../util/mailer/mailer';

const InquiryValidationSchema = z.object({
  name: z.string(),
  // email: z.string().email(),
  phone: z.string(),
  startingDate: z.string(),
  totalBookingDays: z.number().optional().default(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, startingDate, totalBookingDays } = InquiryValidationSchema.parse(body);

    await connectToDatabase();
    let inq = await Inquiry.create({ name, phone, startingDate, totalBookingDays });


    // saveContactSubmission?.({ name, phone, startingDate, totalBookingDays }); // optional

    // console.log(inq);
    await sendDailyEmail([inq]);

    return NextResponse.json({ success: true });

    


  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }

    console.error('Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET() {
  await connectToDatabase();
  const inquiries = await Inquiry.find().lean();
  return NextResponse.json(inquiries);
}
