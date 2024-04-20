import mongoose from 'mongoose'
import QueryBuilder from './queryBuilder.utils'
import type { Query as ExpressQuery } from 'express-serve-static-core'

type TProps<T> = {
  query: ExpressQuery
  Model: mongoose.Model<T, object, object, T>
}
export async function queryBuilderService<T>({ query, Model }: TProps<T>) {
  /** 1. Create QueryBuilder instance */
  const queryBuilder = new QueryBuilder({
    mongooseQuery: Model.find(),
    expressQueryObjInit: query
  })

  /** 2. Build Query */
  const documentsQuery = queryBuilder
    .filter()
    .sort()
    .projectFields()
    .paginate().mongooseQuery

  /** 3. Execute Query */
  const documents = await documentsQuery

  return documents
}
