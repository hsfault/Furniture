// "Play the House": one chapter per homepage section, in page order.
// duration is the glide through the section in seconds; cuts add CUT_SECONDS between chapters.
export const CUT_SECONDS = 1.8;

export const chapters = [
  { id: '01', title: 'Arrival', caption: 'A room in Lahore, lit by whatever time it is where you are.', duration: 6 },
  { id: '02', title: 'Manifesto', caption: 'Carved in Chiniot, oiled by hand, built to outlive its first home.', duration: 5 },
  { id: '03', title: 'Rooms', caption: 'Nine rooms we have furnished, floating at their own pace.', duration: 6 },
  { id: '04', title: 'A Day at Home', caption: 'Seven in the morning to eleven at night, in one long glance.', duration: 9 },
  { id: '05', title: 'Make It Yours', caption: 'One chair, four woods, four cloths, two widths.', duration: 4 },
  { id: '06', title: 'The Sample Fan', caption: 'Eight collections on one brass pivot, turned like a dial.', duration: 4 },
  { id: '07', title: 'Log to Living Room', caption: 'Eighteen months of drying, six planks, not a single screw.', duration: 9 },
  { id: '08', title: 'The Collection', caption: 'Every piece we make, laid out on one endless table.', duration: 4 },
  { id: '09', title: 'Homes', caption: 'Photographs our customers sent back, years later.', duration: 4 },
  { id: '10', title: 'Visit', caption: 'The doors on Main Boulevard are open until eight.', duration: 4 },
];

export const totalDuration = chapters.reduce((s, c, i) => s + c.duration + (i > 0 ? CUT_SECONDS : 0), 0);
