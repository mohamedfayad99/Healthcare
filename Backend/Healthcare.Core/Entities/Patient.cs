namespace Healthcare.Core.Entities;

public class Patient
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string BedNumber { get; set; } = string.Empty;
    public string Department { get; set; } = "Intensive Care";
    public string MobilityStatus { get; set; } = "Immobile";
    public int CreatedByUserId { get; set; }
}
