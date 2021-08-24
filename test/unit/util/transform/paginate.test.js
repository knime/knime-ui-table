import { paginate } from '~/components/table/util/transform/paginate';

describe('paginate', () => {
    it('returns an empty page if no data', () => {
        let paginationConfig = {
            sortedData: [[]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual([[]]);
    });

    it('returns a single page worth of data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual([[1, 2, 3, 4, 5]]);
    });

    it('returns a partial page worth of data if not enough rows', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5, 6, 7]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual([[6, 7]]);
    });

    it('returns an empty page if not enough rows for a single page', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3, 4, 5]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual([[]]);
    });

    it('returns grouped page data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]],
            pageSize: 5,
            pageStart: 0,
            pageEnd: 5
        };
        expect(paginate(paginationConfig)).toStrictEqual([[1, 2, 3], [4, 5], [], []]);
    });

    it('returns partial grouped data', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5], [6, 7, 8], [9, 10]],
            pageSize: 4,
            pageStart: 5,
            pageEnd: 10
        };
        expect(paginate(paginationConfig)).toStrictEqual([[], [], [6, 7, 8], [9]]);
    });

    it('returns grouped data split across multiple pages', () => {
        let paginationConfig = {
            sortedData: [[1, 2, 3], [4, 5, 6, 7, 8], [9, 10]],
            pageSize: 5,
            pageStart: 5,
            pageEnd: 11
        };
        expect(paginate(paginationConfig)).toStrictEqual([[], [6, 7, 8], [9, 10]]);
    });
});
