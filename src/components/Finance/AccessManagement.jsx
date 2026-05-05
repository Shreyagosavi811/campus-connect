export default function AccessManagement({ users, currentUser, onToggleAccess }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-indigo-600 rounded-full" />
        Platform Access Control
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Name</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Email</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Role</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Department</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-800 text-sm">{u.name}</td>
                <td className="p-4 text-sm text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 
                    u.role === 'HOD' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{u.department || '-'}</td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      onClick={() => onToggleAccess(u)}
                      disabled={u.id === currentUser?.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        u.financeAccess ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${u.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          u.financeAccess ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${u.financeAccess ? "text-emerald-600" : "text-slate-400"}`}>
                      {u.financeAccess ? "Granted" : "Revoked"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
