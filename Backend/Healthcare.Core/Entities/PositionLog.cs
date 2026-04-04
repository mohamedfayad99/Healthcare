using System;

namespace Healthcare.Core.Entities;

public class PositionLog
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string TargetPosition { get; set; } = string.Empty; // "Right", "Left", "Back", "Sitting"
    public DateTime ChangedAt { get; set; }
    public int ChangedByUserId { get; set; }
    public bool IsMissed { get; set; }
    
    public Patient? Patient { get; set; }
    public User? ChangedByUser { get; set; }
}
