import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

public class SyncPlayer {
    public String uuid;
    public String name;
    public String team;
    public int life;

    public SyncVector3 position;
    public SyncVector2[] rotations;

    public int weapon;
    public String[] weapons;

    public String state;
    public String animation;

    public SyncPlayer(String uuid, String name) {
        this.uuid = uuid;
        this.name = name;
        this.team = null;
        this.life = 100;

        this.position = new SyncVector3(0, 0, 0);
        this.rotations = new SyncVector2[] {
            new SyncVector2(0, 0),
            new SyncVector2(0, 0)
        };

        this.weapon = -1;
        this.weapons = new String[0];

        this.state = "alive";
        this.animation = "idle";
    }

    public static SyncPlayer fromJSON(JSONObject json) {
        String uuid = null;
        String name = "Unknown";

        try {
            uuid = json.getString("uuid");
        } catch (JSONException ignored) {}

        try {
            name = json.getString("name");
        } catch (JSONException ignored) {}

        SyncPlayer p = new SyncPlayer(uuid, name);

        try {
            p.team = json.getString("team");
        } catch (JSONException ignored) {}

        try {
            p.life = json.getInt("life");
        } catch (JSONException ignored) {}

        try {
            p.position = SyncVector3.fromJSON(json.getJSONObject("position"));
        } catch (JSONException ignored) {}

        try {
            JSONArray arr = json.getJSONArray("rotations");
            if (arr.length() == 2) {
                p.rotations[0] = SyncVector2.fromJSON(arr.getJSONObject(0));
                p.rotations[1] = SyncVector2.fromJSON(arr.getJSONObject(1));
            }
        } catch (JSONException ignored) {}

        try {
            p.weapon = json.getInt("weapon");
        } catch (JSONException ignored) {}

        try {
            JSONArray arr = json.getJSONArray("weapons");
            p.weapons = new String[arr.length()];
            for (int i = 0; i < arr.length(); i++) {
                p.weapons[i] = arr.getString(i);
            }
        } catch (JSONException ignored) {}

        try {
            p.state = json.getString("state");
        } catch (JSONException ignored) {}

        try {
            p.animation = json.getString("animation");
        } catch (JSONException ignored) {}

        return p;
    }

    public JSONObject toJSON() {
        JSONObject json = new JSONObject();
        try {
            json.put("uuid", uuid);
            json.put("name", name);
            json.put("team", team);
            json.put("life", life);
            json.put("position", position.toJSON());

            JSONArray rot = new JSONArray();
            rot.put(rotations[0].toJSON());
            rot.put(rotations[1].toJSON());
            json.put("rotations", rot);

            json.put("weapon", weapon);

            JSONArray weaponsArr = new JSONArray();
            for (String w : weapons) {
                weaponsArr.put(w);
            }
            json.put("weapons", weaponsArr);

            json.put("state", state);
            json.put("animation", animation);

        } catch (JSONException ignored) {}

        return json;
    }
              }
