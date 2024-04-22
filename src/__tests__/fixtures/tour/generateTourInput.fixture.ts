import type { TCreateTourInput } from '../../../zodSchema/tour.zodSchema'

export const EXTRAVAGANT_DISCOUNT = 10000

export const generateTourInput = (): TCreateTourInput['body'] => {
  const rdm = Math.random() * 100

  return {
    name: crypto.randomUUID().slice(0, 40), // unique
    duration: rdm < 50 ? 5 : 10,
    maxGroupSize: 25,
    difficulty: 'easy',
    price: 397,
    discount: 99,
    summary: 'Breathtaking hike through the Canadian Banff National Park',
    description:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    imageCover: 'tour-1-cover.jpg',
    images: ['tour-1-1.jpg', 'tour-1-2.jpg', 'tour-1-3.jpg'],
    startDates: [
      '2024-04-25T09:00:00.000Z',
      '2024-07-20T09:00:00.000Z',
      '2024-10-05T09:00:00.000Z'
    ],
    startLocation: {
      description: 'Banff, CAN',
      type: 'Point',
      coordinates: [-115.570154, 51.178456]
    },
    locations: [
      {
        description: 'Banff National Park',
        type: 'Point',
        coordinates: [-116.214531, 51.417611],
        day: 1
      },
      {
        description: 'Jasper National Park',
        type: 'Point',
        coordinates: [-118.076152, 52.875223],
        day: 3
      },
      {
        description: 'Glacier National Park of Canada',
        type: 'Point',
        coordinates: [-117.490309, 51.261937],
        day: 5
      }
    ],
    guides: [
      '5c8a21d02f8fb814b56fa189',
      '5c8a201e2f8fb814b56fa186',
      '5c8a1f292f8fb814b56fa184'
    ]
  }
}
