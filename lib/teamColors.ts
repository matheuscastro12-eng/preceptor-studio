export const TEAM_COLORS: Record<
  string,
  { name: string; role: string; color: string; textColor: string; initials: string }
> = {
  matheus: { name: "Matheus", role: "CTO/Dev", color: "#5D57EB", textColor: "#FFFFFF", initials: "MC" },
  luciano: { name: "Luciano", role: "CEO", color: "#0A1F44", textColor: "#FFFFFF", initials: "LU" },
  ana_flavia: { name: "Ana Flávia", role: "Admin/People", color: "#B964FF", textColor: "#FFFFFF", initials: "AF" },
  thiago: { name: "Thiago", role: "Growth", color: "#52E1E7", textColor: "#0A1F44", initials: "TH" },
  leonardo: { name: "Leonardo", role: "Tráfego Sr", color: "#0EA5A4", textColor: "#FFFFFF", initials: "LE" },
  marco: { name: "Marco", role: "Tráfego Jr", color: "#10B981", textColor: "#FFFFFF", initials: "MA" },
  kalley: { name: "Kalley", role: "Designer", color: "#F59E0B", textColor: "#FFFFFF", initials: "KA" },
};

export type TeamMember = keyof typeof TEAM_COLORS;
