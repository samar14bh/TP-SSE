import { Injectable } from "@nestjs/common";
import { ObjectLiteral,SelectQueryBuilder } from "typeorm";

export interface PaginationResult<T> {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }
@Injectable()
export class PaginationService {

constructor() { }

async paginateQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return {
      data,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

//previous code before correcting the function
/*async paginate<T extends ObjectLiteral>(
    repository:Repository<T>,
    page: number=1,
    limit: number=10,
):Promise<any>
{
    const skip= (page - 1) * limit;
    const [result, total] = await repository.findAndCount({
        skip,
        take: limit,
    });
    return {
        data: result,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    };

}*/


}
