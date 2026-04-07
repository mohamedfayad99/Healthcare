namespace Healthcare.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "Nurse";
    public string ProfileImage { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
