export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-7 h-7 border-2 border-[#c8b99a]/30 border-t-[#c8b99a] rounded-full animate-spin" />
        <p className="font-body text-[0.72rem] tracking-widest uppercase text-[#555]">Carregando...</p>
      </div>
    </div>
  )
}
