import { fetchWithAuth } from "../../../services/api/fetchWithAuth";                                                                  
                                                                                                                        
  export const fetchUserMonthlySummary = async (date, { toast } = {}) => {                                                              
    const res = await fetchWithAuth(`/api/user_monthly_work_summary/?date=${date}`, {}, { toast });                                  
   if (!res || !res.ok) {                                                                                                               
     throw new Error("월간 근무 정보를 가져오는 데 실패했습니다.");      
   }                                                                 
   return res.json();                                                                                                                  
};          