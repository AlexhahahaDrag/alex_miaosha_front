import {
    getDataOne,
    baseService,
  } from "@/api/common/index";
  
  const baseFinanceAnalysis = "/finance-analysis";
  
  const financeAnalysisUrl = {
    getBalance: "/getBalance",
    getIncomeAndExpense: "/getIncomeAndExpense",
  };

export function getBalance(belongTo?: number, searchDate?: string): Promise<any> {
    return getDataOne(baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBalance + 
        "?belongTo=" + belongTo + "&searchDate="+ searchDate);
  }

  export function getIncomeAndExpense(belongTo?: number, searchDate?: string, type?: string): Promise<any> {
    let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getIncomeAndExpense + '?1=1';
    if(belongTo) {
      url += "&belongTo=" + belongTo;
    }
    if (searchDate) {
      url += "&searchDate=" + searchDate;
    }
    if(type) {
      url += "&type=" + type
    }
    return getDataOne(url);
  }