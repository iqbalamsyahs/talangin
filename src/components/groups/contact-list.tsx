"use client";

import { Loader2, Trash2, Users } from "lucide-react";
import React from "react";

import { Contact } from "@/types/contact";

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  onAddMember: (name: string) => void;
  onDeleteContact: (id: string, e: React.MouseEvent) => void;
}

export function ContactList({
  contacts,
  loading,
  onAddMember,
  onDeleteContact,
}: ContactListProps) {
  return (
    <div className="space-y-2">
      {/* Label dihapus karena sudah jelas di tab */}
      {/* <Label>Teman Tersimpan</Label> */}

      <div className="bg-muted/10 h-[200px] w-full space-y-1 overflow-y-auto rounded-md border p-2">
        {loading ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat...
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center text-xs">
            <Users className="mb-2 h-8 w-8 opacity-20" />
            <p>Belum ada kontak.</p>
            <p>Simpan teman di tab sebelah dulu.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onAddMember(contact.name)}
              className="group hover:border-border flex cursor-pointer items-center justify-between rounded-md border border-transparent p-2 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{contact.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Indikator Pilih */}
                <span className="text-primary text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
                  PILIH
                </span>
                {/* Tombol Hapus Kontak */}
                <button
                  onClick={(e) => onDeleteContact(contact.id, e)}
                  className="text-muted-foreground hover:text-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
