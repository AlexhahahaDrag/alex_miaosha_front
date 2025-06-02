// 充值表单
export interface IRechargeForm {
    id?: string;
    cardId?: string;
    cardName?: string;
    consumeAmount?: number;
    type?: string;
    userId?: number;
    description?: string;
}

// 表格列定义
export const columns = [
    {
        title: '日期',
        dataIndex: 'operateTime',
        key: 'operateTime',
        width: 180,
    },
    {
        title: '卡名称',
        dataIndex: 'cardName',
        key: 'cardName',
        width: 180,
    },
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
    },
    {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
    },
]