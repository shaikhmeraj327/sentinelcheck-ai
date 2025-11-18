import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Copy,
  Search,
  DollarSign,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { AnalysisResult, FraudAlert } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultsViewProps {
  result: AnalysisResult;
}

const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    SAFE: 'bg-green-100 text-green-700 border-green-200',
    CAUTION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    SUSPICIOUS: 'bg-orange-100 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${colors[level] || colors.CAUTION}`}>
      {level}
    </span>
  );
};

const AlertItem: React.FC<{ alert: FraudAlert }> = ({ alert }) => {
  const colors: Record<string, string> = {
    LOW: 'text-blue-600 bg-blue-50 border-blue-100',
    MEDIUM: 'text-orange-600 bg-orange-50 border-orange-100',
    HIGH: 'text-red-600 bg-red-50 border-red-100',
  };
  
  const icons: Record<string, React.ReactNode> = {
    LOW: <CheckCircle2 className="w-4 h-4" />,
    MEDIUM: <AlertTriangle className="w-4 h-4" />,
    HIGH: <XCircle className="w-4 h-4" />,
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[alert.severity]} mb-2`}>
      <div className="mt-0.5">{icons[alert.severity]}</div>
      <div>
        <p className="text-sm font-semibold">{alert.flag}</p>
        <p className="text-xs opacity-80">{alert.description}</p>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string | boolean | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%] truncate">
      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
    </span>
  </div>
);

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const { extraction, fraudAnalysis } = result;

  // Chart Data
  const riskData = [
    { name: 'Risk', value: fraudAnalysis.riskScore },
    { name: 'Safe', value: 100 - fraudAnalysis.riskScore },
  ];
  const riskColors = fraudAnalysis.riskScore > 75 ? ['#EF4444', '#F3F4F6'] : 
                     fraudAnalysis.riskScore > 40 ? ['#F59E0B', '#F3F4F6'] : 
                     ['#10B981', '#F3F4F6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Fraud Analysis Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {fraudAnalysis.riskScore > 50 ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-green-500" />}
              Fraud Analysis
            </h3>
            <RiskBadge level={fraudAnalysis.riskLevel} />
          </div>

          <div className="h-48 relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 top-10 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-slate-800">{fraudAnalysis.riskScore}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-widest">Risk Score</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 mb-4">
            <p className="font-medium mb-1 text-slate-900">Analysis Summary</p>
            {fraudAnalysis.reasoning}
          </div>

          <div className="space-y-1">
            {fraudAnalysis.alerts.length > 0 ? (
              fraudAnalysis.alerts.map((alert, idx) => <AlertItem key={idx} alert={alert} />)
            ) : (
              <div className="text-center py-4 text-slate-400 text-sm">No active fraud alerts detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Data Column */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Extracted Data
            </h3>
            <button 
               className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
               onClick={() => navigator.clipboard.writeText(JSON.stringify(extraction, null, 2))}
            >
              <Copy className="w-4 h-4" /> Copy JSON
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Transaction Details</h4>
              <DetailRow icon={<DollarSign className="w-4 h-4"/>} label="Amount (Numeric)" value={`$${extraction.amountNumeric}`} />
              <DetailRow icon={<DollarSign className="w-4 h-4"/>} label="Amount (Text)" value={extraction.amountText} />
              <DetailRow icon={<Calendar className="w-4 h-4"/>} label="Date" value={extraction.date} />
              <DetailRow icon={<Building2 className="w-4 h-4"/>} label="Check Number" value={extraction.checkNumber} />
              <DetailRow icon={<Copy className="w-4 h-4"/>} label="Memo" value={extraction.memo} />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parties Involved</h4>
              <DetailRow icon={<User className="w-4 h-4"/>} label="Payee" value={extraction.payeeName} />
              <DetailRow icon={<User className="w-4 h-4"/>} label="Payer" value={extraction.payerName} />
              <DetailRow icon={<Building2 className="w-4 h-4"/>} label="Bank Name" value={extraction.bankName} />
              <DetailRow icon={<Building2 className="w-4 h-4"/>} label="Routing Number" value={extraction.routingNumber} />
              <DetailRow icon={<Building2 className="w-4 h-4"/>} label="Account Number" value={extraction.accountNumber} />
            </div>
          </div>

          <div className="bg-blue-50 p-4 border-t border-blue-100 flex items-center justify-between">
             <div className="flex items-center gap-2 text-sm text-blue-800">
                <div className={`w-2 h-2 rounded-full ${extraction.isSigned ? 'bg-green-500' : 'bg-red-500'}`}></div>
                Signature Detected: <span className="font-bold">{extraction.isSigned ? 'Yes' : 'No'}</span>
             </div>
             {extraction.micrLine && (
                <div className="text-xs font-mono bg-white px-3 py-1 rounded border border-blue-200 text-slate-600">
                  {extraction.micrLine}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
