"use client";

import { Avatar } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
}

interface MemberToggleProps {
  members: Member[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MemberToggle({ members, selected, onChange }: MemberToggleProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => {
        const active = selected.includes(member.id);
        return (
          <button
            key={member.id}
            onClick={() => toggle(member.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all active:scale-95 ${
              active
                ? "bg-amber-500/10 border-amber-500 text-amber-500"
                : "bg-[#1a1a1a] border-[#2e2e2e] text-[#888888]"
            }`}
          >
            <Avatar
              src={member.avatar_url}
              name={member.name}
              size="sm"
            />
            <span className="text-sm font-medium">{member.name}</span>
          </button>
        );
      })}
    </div>
  );
}
