using Ghp.Portal.Service.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System;
using MongoDB.Bson;
using Amazon.Runtime.Internal.Util;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Text.Json;

namespace Ghp.Portal.Service.Services
{
    public class UsersService
    {
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<UsersService> logger;

        public UsersService(IUsersDatabaseSettings settings, ILogger<UsersService> logger)
        {
            try
            {
                this.logger = logger;
                logger.LogError("Database name: " + settings.ConnectionString);
                var client = new MongoClient(settings.ConnectionString);
                var database = client.GetDatabase(settings.DatabaseName);
                _users = database.GetCollection<User>(settings.UsersCollectionName);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while connecting to database");
            }
        }

        public List<User> Get() => _users.Find(User => true).ToList();

        public List<User> Get(string id)
        {
            try
            {
                logger.LogInformation("Get user by id: " + id);
                var filter = Builders<User>.Filter.Or(
                Builders<User>.Filter.Regex(user => user.FirstName, new BsonRegularExpression($".*{id}.*")),
                Builders<User>.Filter.Regex(user => user.LastName, new BsonRegularExpression($".*{id}.*")));
                var resultData = _users.Find(filter).ToList();
                logger.LogInformation("Found " + resultData.Count + " users");
                return resultData;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while connecting to database");
                return new List<User>();
            }
        }
        public User GetById(string id) => _users.Find(User => User.Id == id).FirstOrDefault();
        public User GetByEmail(string email) => _users.Find(User => User.Email == email).FirstOrDefault();

        public User Create(User User)
        {
            if (GetByEmail(User.Email) != null)
            {
                throw new Exception("User with this email already exists");
            }
            _users.InsertOne(User);
            return User;
        }

        public void Update(string id, User updatedUser) => _users.ReplaceOne(User => User.Id == id, updatedUser);

        public void Delete(User UserForDeletion) => _users.DeleteOne(User => User.Id == UserForDeletion.Id);

        public void Delete(string id) => _users.DeleteOne(User => User.Id == id);
    }

    public class JwtService
    {
        private readonly JwtSettings _config;

        public JwtService(JwtSettings config)
        {
            _config = config;
        }
        public string CreateAuthenticationToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenKey = Encoding.UTF8.GetBytes(_config.Key);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                new(ClaimTypes.Name, user.Email),
                }),

                Expires = DateTime.UtcNow.AddMinutes(100),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }

    public class ProjectsService
    {
        private readonly IMongoCollection<Project> _projects;
        private readonly IMongoCollection<ProjectFilter> _projectFilter;

        public ProjectsService(IUsersDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _projects = database.GetCollection<Project>(settings.ProjectsCollectionName);
            _projectFilter = database.GetCollection<ProjectFilter>(settings.ProjectFilterCollectionName);
        }

        public List<Project> GetByIds(string[] ids)
        {
            if (ids == null || ids.Length == 0)
            {
                return new List<Project>();
            }
            var filter = Builders<Project>.Filter.In(x => x.Id, ids);
            var resultCursor = _projects.Find(filter);
            return resultCursor.ToList();
        }
        public ProjectFilter GetFilters()
        {
            var resultCursor = _projectFilter.Find(x => x.Id != null);
            return resultCursor.FirstOrDefault();
        }

        public List<Project> Get(string search)
        {
            if (string.IsNullOrEmpty(search))
            {
                var resultCursor = _projects.Find(x => x.Status != ProjectStatus.None);
                return resultCursor.ToList();
            }

            // Try to parse search as a JSON filter object. If parsing fails,
            // treat the search string as a plain-text search across common fields.
            Filter filterObj = null;
            try
            {
                filterObj = JsonSerializer.Deserialize<Filter>(search);
            }
            catch
            {
                filterObj = null;
            }

            if (filterObj != null)
            {
                var projects = _projects.Find(x =>
                    (filterObj.status == "None" || x.Status.ToString() == filterObj.status) &&
                    (filterObj.region == "None" || x.Geographic == filterObj.region) &&
                    (filterObj.year == "None" || x.ProjectedYear == filterObj.year)
                ).ToList();
                return projects;
            }

            // Plain text search (case-insensitive) across name, geographic, production type, year
            var textFilter = Builders<Project>.Filter.Or(
                Builders<Project>.Filter.Regex(p => p.Name, new BsonRegularExpression($".*{search}.*", "i")),
                Builders<Project>.Filter.Regex(p => p.Geographic, new BsonRegularExpression($".*{search}.*", "i")),
                Builders<Project>.Filter.Regex(p => p.ProductionType, new BsonRegularExpression($".*{search}.*", "i")),
                Builders<Project>.Filter.Regex(p => p.ProjectedYear, new BsonRegularExpression($".*{search}.*", "i"))
            );

            return _projects.Find(textFilter).ToList();
        }
    }

    public class InvestorsService
    {
        private readonly IMongoCollection<Investor> _investors;

        public InvestorsService(IUsersDatabaseSettings settings)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _investors = database.GetCollection<Investor>(settings.InvestorsCollectionName);
        }

        public async Task<List<Investor>> Get(string search)
        {
            if (string.IsNullOrEmpty(search))
            {
                var resultCursor = await _investors.FindAsync(x => x.Id != null);
                return await resultCursor.ToListAsync();
            }
            // Try parse search as JSON filter
            try
            {
                var filter = JsonSerializer.Deserialize<InvestorSearchFilter>(search);
                var builder = Builders<Investor>.Filter;
                var filters = new List<FilterDefinition<Investor>>();

                if (!string.IsNullOrEmpty(filter.geography) && filter.geography.ToLower() != "any" && filter.geography.ToLower() != "none")
                {
                    filters.Add(builder.Regex(i => i.Geography, new BsonRegularExpression($".*{filter.geography}.*", "i")));
                }

                if (!string.IsNullOrEmpty(filter.type) && filter.type.ToLower() != "any" && filter.type.ToLower() != "none")
                {
                    // try match against Strategy or Conditions fields for a "type" match
                    filters.Add(builder.Or(
                        builder.Regex(i => i.Strategy, new BsonRegularExpression($".*{filter.type}.*", "i")),
                        builder.Regex(i => i.Conditions, new BsonRegularExpression($".*{filter.type}.*", "i"))
                    ));
                }

                // InvestmentSize is stored as string; attempt numeric comparison by extracting digits
                if (filter.minInvestment.HasValue || filter.maxInvestment.HasValue)
                {
                    var invs = await _investors.FindAsync(i => true);
                    var all = await invs.ToListAsync();
                    var matched = new List<Investor>();
                    foreach (var inv in all)
                    {
                        if (string.IsNullOrEmpty(inv.InvestmentSize)) continue;
                        // extract digits and dots
                        var cleaned = System.Text.RegularExpressions.Regex.Replace(inv.InvestmentSize, "[^0-9.]+", "");
                        if (!double.TryParse(cleaned, out var amt)) continue;
                        if (filter.minInvestment.HasValue && amt < filter.minInvestment.Value) continue;
                        if (filter.maxInvestment.HasValue && amt > filter.maxInvestment.Value) continue;
                        matched.Add(inv);
                    }

                    // apply other filters to matched set
                    if (filters.Count > 0)
                    {
                        var ids = matched.Select(m => m.Id).ToHashSet();
                        var cursor = await _investors.FindAsync(i => ids.Contains(i.Id));
                        var list = await cursor.ToListAsync();
                        return list;
                    }

                    return matched;
                }

                var finalFilter = filters.Count > 0 ? builder.And(filters) : builder.Empty;
                var cursorFiltered = await _investors.FindAsync(finalFilter);
                return await cursorFiltered.ToListAsync();
            }
            catch
            {
                var cursor = await _investors.FindAsync(x => x.Name.ToLower().Contains(search.ToLower()) == true);
                return await cursor.ToListAsync();
            }
        }
        public async Task<List<Investor>> GetByGeography(string search)
        {
            var cursor = await _investors.FindAsync(x => x.Geography.ToLower().Contains(search.ToLower()) == true || "all-All" == search);
            return await cursor.ToListAsync();
        }

    }
}

// Helper DTO for parsing investor filter from client
internal class InvestorSearchFilter
{
    public string type { get; set; }
    public string geography { get; set; }
    public double? minInvestment { get; set; }
    public double? maxInvestment { get; set; }
}