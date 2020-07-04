local name = redis.call("hget",KEYS[1],"name")
if not name then
	return redis.call("hmset",KEYS[1],"name",ARGV[1],"address",ARGV[2],"telephone",ARGV[3])
else
	return "not_updated"
end