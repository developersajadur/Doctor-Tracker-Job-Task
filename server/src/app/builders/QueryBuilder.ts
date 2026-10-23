import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = (this.query.search || this.query.searchTerm) as string;
    if (searchTerm) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));

      this.modelQuery = this.modelQuery.find({
        $or: searchConditions,
      } as FilterQuery<T>);
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.query };
    const excludeFields = ['search', 'searchTerm', 'sort', 'limit', 'page', 'fields', 'startDate', 'endDate'];
    excludeFields.forEach((field) => delete queryCopy[field]);

    // Handle date range filtering if startDate or endDate provided
    const dateFilters: Record<string, any> = {};
    if (this.query.startDate) {
      dateFilters.$gte = new Date(this.query.startDate as string);
    }
    if (this.query.endDate) {
      const end = new Date(this.query.endDate as string);
      end.setHours(23, 59, 59, 999);
      dateFilters.$lte = end;
    }

    if (Object.keys(dateFilters).length > 0) {
      (queryCopy as any).createdAt = dateFilters;
    }

    this.modelQuery = this.modelQuery.find(queryCopy as FilterQuery<T>);
    return this;
  }

  sort() {
    const sortKey = this.query.sort as string;

    const sortMap: Record<string, string> = {
      newest: '-createdAt',
      oldest: 'createdAt',
      nameAsc: 'name',
      nameDesc: '-name',
      mostPatients: '-activePatientCount',
      leastPatients: 'activePatientCount',
    };

    const sortBy = sortMap[sortKey] || (sortKey ? sortKey.split(',').join(' ') : '-createdAt');
    this.modelQuery = this.modelQuery.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.max(1, Number(this.query.limit) || 10);
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query.fields as string)?.split(',').join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const filter = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(filter);

    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.max(1, Number(this.query.limit) || 10);
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
