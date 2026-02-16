import * as z from 'zod';

export const complaintSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
    category: z.enum([
        'Infrastructure',
        'Sanitation',
        'Public Safety',
        'Water Supply',
        'Electricity',
        'Roads & Transport',
        'Parks & Recreation',
        'Other'
    ], {
        required_error: 'Please select a category',
    }),
    description: z.string().min(20, 'Please provide a more detailed description (min 20 chars)').max(1000, 'Description too long'),
    address: z.string().min(5, 'Address is required'),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
    }),
    images: z.array(z.string()).max(5, 'Maximum 5 images allowed'),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;
