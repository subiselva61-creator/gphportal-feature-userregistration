namespace Ghp.Portal.Service.Models
{
    public class UsersDatabaseSettings : IUsersDatabaseSettings
    {
        public string UsersCollectionName { get; set; }
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
        public string ProjectsCollectionName { get; set; }
        public string InvestorsCollectionName { get; set; }
        public string ProjectFilterCollectionName { get; set; }
    }

    public interface IUsersDatabaseSettings
    {

        string UsersCollectionName { get; set; }
        string ProjectsCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
        string InvestorsCollectionName { get; set; }
        string ProjectFilterCollectionName { get; set; }

    }


    public class JwtSettings
    {
        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
    }
}