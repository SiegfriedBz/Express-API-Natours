import mongoose from 'mongoose'
import _ from 'lodash'
import QueryBuilder from './queryBuilder.utils'
import type { Query as ExpressQuery } from 'express-serve-static-core'
import type { TQueryFilterByTourId } from '../middleware/setQueryFilterByTourId'
import type { TQueryFilterGeoQuery } from '../services/tour.service'

type TProps<T> = {
  queryFilterByTourId?: TQueryFilterByTourId
  queryFilterGeoQuery?: TQueryFilterGeoQuery
  query: ExpressQuery
  Model: mongoose.Model<T, object, object, T>
}

/**
 * Builds and executes a query using the provided parameters.
 * @param {TProps<T>} props - The properties required for the query.
 * @returns {Promise<T[]>} - The result of the executed query.
 */
export async function queryBuilderService<T>({
  queryFilterByTourId = {},
  queryFilterGeoQuery = {},
  query,
  Model
}: TProps<T>): Promise<T[]> {
  /*** Get filter options if any
   *
   ** Case 1 - queryFilterByTourId
   * Case 1.1 GET /tours/:id/reviews => all reviews for 1 tour
   * Case 1.2 GET /tours/:id/bookings => all bookings for 1 tour
   *
   ** Case 2 - queryFilterGeoQuery
   *  GET tours/within/:distance/center/:latlng/unit/:unit
   */

  /** Set queryFilter if any */
  const queryFilter = !_.isEmpty(queryFilterByTourId)
    ? queryFilterByTourId
    : !_.isEmpty(queryFilterGeoQuery)
      ? queryFilterGeoQuery
      : {}

  /** Create QueryBuilder instance */
  const queryBuilder = new QueryBuilder({
    mongooseQuery: Model.find(queryFilter),
    expressQueryObjInit: query
  })

  /** Build Query */
  const documentsQuery = queryBuilder
    .filter()
    .sort()
    .projectFields()
    .paginate().mongooseQuery

  /** Execute Query */
  const documents = await documentsQuery

  return documents
}
