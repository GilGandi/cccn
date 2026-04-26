'use client'
import { useState } from 'react'

export default function ModalLGPD({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#c8b99a]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h2 className="font-display text-[1rem] text-[#f0ede8]">Privacidade e Uso de Dados</h2>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#f0ede8] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-[#888480] font-body text-[0.82rem] leading-relaxed space-y-4">
          <p className="text-[#f0ede8] font-medium">Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Quais dados coletamos</h3>
            <p>Nome completo, telefone celular, sexo e idade — somente os campos que você preencher e que forem marcados como obrigatórios pelo evento.</p>
          </div>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Para que usamos</h3>
            <p>Exclusivamente para organização interna de eventos da Comunidade Cristã de Campos Novos. Seus dados <strong className="text-[#f0ede8]">não são vendidos, compartilhados nem utilizados para fins comerciais</strong>.</p>
          </div>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Quem acessa seus dados</h3>
            <p>Apenas membros autorizados da equipe administrativa da CCCN, para fins de organização e comunicação sobre o evento inscrito.</p>
          </div>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Por quanto tempo guardamos</h3>
            <p>Seus dados são mantidos enquanto necessário para as atividades da comunidade. Você pode solicitar a exclusão a qualquer momento.</p>
          </div>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Seus direitos</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Acesso aos dados que guardamos sobre você</li>
              <li>Correção de dados incorretos ou desatualizados</li>
              <li>Exclusão dos seus dados do nosso sistema</li>
              <li>Revogação do consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">Para exercer qualquer direito, entre em contato conosco pelo telefone ou presencialmente.</p>
          </div>

          <div>
            <h3 className="font-body font-semibold text-[0.75rem] tracking-widest uppercase text-[#c8b99a] mb-2">Responsável pelos dados</h3>
            <p>Comunidade Cristã de Campos Novos — C.C.C.N Ministério Apostólico do Coração de Deus<br />CNPJ: 18.702.714/0001-07</p>
          </div>
        </div>
        <div className="px-6 pb-5 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 bg-[#c8b99a] text-[#0a0a0a] font-body font-semibold text-[0.72rem] tracking-widest uppercase rounded-md hover:bg-[#d4c8b0] transition-all">
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
