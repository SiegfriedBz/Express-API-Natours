/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, Query } from 'mongoose'
import { Query as ExpressQuery } from 'express-serve-static-core'

export const MAX_RESULTS_PER_PAGE = 4

/**
 * A utility class for building queries using Mongoose.
 * @template T - The type of the Mongoose document.
 */
class QueryBuilder<T> {
  mongooseQuery: Query<any, T>
  expressQueryObjInit: ExpressQuery

  constructor({
    mongooseQuery,
    expressQueryObjInit
  }: {
    mongooseQuery: Query<any, T>
    expressQueryObjInit: ExpressQuery
  }) {
    this.mongooseQuery = mongooseQuery
    this.expressQueryObjInit = expressQueryObjInit
  }

  /** FILTER & RETURN Mongoose Query */
  // Convert Express query string to Mongoose filter query
  // 'lt' / 'gt' to '$lt' / '$gt'
  filter() {
    const mongooseFilterQuery: FilterQuery<T> = {}
    /** duration: {
      "lt": "10"
    } */

    for (const key in this.expressQueryObjInit) {
      if (!['page', 'limit', 'sort', 'fields'].includes(key)) {
        const queryParamObject = this.expressQueryObjInit[key] as Record<
          string,
          string
        >
        /**  {
              "lt": "10"
          } */

        if (
          typeof queryParamObject === 'object' &&
          queryParamObject !== null &&
          ('lt' in queryParamObject ||
            'lte' in queryParamObject ||
            'gt' in queryParamObject ||
            'gte' in queryParamObject)
        ) {
          const newObj: Record<string, string> = {}

          for (const ObjKey in queryParamObject) {
            let newKey = ObjKey
            if (newKey === 'lt') newKey = '$lt'
            if (newKey === 'lte') newKey = '$lte'
            if (newKey === 'gt') newKey = '$gt'
            if (newKey === 'gte') newKey = '$gte'
            newObj[newKey] = queryParamObject[ObjKey]
          }
          ;(mongooseFilterQuery as Record<string, typeof newObj>)[key] = newObj
        } else if (key === 'difficulty') {
          // Handle 'difficulty' key specifically
          ;(mongooseFilterQuery as Record<string, unknown>)[key] =
            this.expressQueryObjInit[key]
        }
      }
    }

    this.mongooseQuery = this.mongooseQuery.find(mongooseFilterQuery)

    return this
  }

  /** SORT & RETURN Mongoose Query */
  // ?sort=price || ?sort=price,key02 ...
  sort() {
    if (
      this.expressQueryObjInit.sort &&
      typeof this.expressQueryObjInit.sort === 'string'
    ) {
      const sortBy = this.expressQueryObjInit.sort?.split(',')?.join(' ') || ''
      if (sortBy) {
        this.mongooseQuery = this.mongooseQuery.sort(sortBy)
      }
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt _id')
    }

    return this
  }

  /** FIELDS PROJECTION & RETURN Mongoose Query */
  // LIMIT FIELDS to be returned - ?fields=price,difficulty,duration
  projectFields() {
    if (
      this.expressQueryObjInit.fields &&
      typeof this.expressQueryObjInit.fields === 'string'
    ) {
      const selectedFields = this.expressQueryObjInit.fields
        .split(',')
        .join(' ')
      this.mongooseQuery = this.mongooseQuery.select(selectedFields) as Query<
        unknown,
        T
      >
    }

    return this
  }

  /** PAGINATE & RETURN Mongoose Query */
  paginate() {
    const currentPage =
      (this.expressQueryObjInit.page &&
        Math.abs(+this.expressQueryObjInit.page)) ||
      1
    const limit =
      (this.expressQueryObjInit.limit &&
        Math.abs(+this.expressQueryObjInit.limit)) ||
      MAX_RESULTS_PER_PAGE
    const skip = (currentPage - 1) * limit

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)

    return this
  }
}

export default QueryBuilder
