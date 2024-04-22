import z from 'zod'

/** create booking on tour with id */
const createBookingParams = {
  id: z.string() // tour id
}

const createBookingZodSchema = z.object({
  params: z.object(createBookingParams)
})

type TCreateBookingInput = z.TypeOf<typeof createBookingZodSchema>

export { createBookingZodSchema }
export { TCreateBookingInput }
